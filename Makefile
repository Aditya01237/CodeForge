SHELL := /bin/bash

ROOT_DIR := $(shell pwd)

BACKEND_DIR := codeforge
FRONTEND_DIR := algojudge
JUDGE_DIR := judge-service

MYSQL_CONTAINER := codeforge-mysql
MYSQL_ROOT_PASSWORD := Root@12345
MYSQL_DATABASE := codeforge

LOG_DIR := $(ROOT_DIR)/logs
PID_DIR := $(ROOT_DIR)/.pids

DOCKER_COMPOSE := docker compose

.PHONY: help setup install infra redis mysql runner-images start run stop stop-app stop-infra restart status logs backend-log judge-log frontend-log backend judge frontend urls open clean

help:
	@echo ""
	@echo "CodeForge Make Commands"
	@echo "-----------------------"
	@echo "make setup          Install deps + build runner images"
	@echo "make start          Start full project in background"
	@echo "make stop           Stop app processes + infra"
	@echo "make restart        Restart full project"
	@echo "make status         Show status"
	@echo "make logs           Tail all logs"
	@echo "make open           Open frontend"
	@echo ""

setup: install runner-images
	@echo "✅ Setup complete"

install:
	@echo "📦 Installing frontend dependencies..."
	cd "$(FRONTEND_DIR)" && npm install
	@echo "📦 Installing Go dependencies..."
	cd "$(JUDGE_DIR)" && go mod tidy
	@echo "✅ Dependencies installed"

infra: redis mysql
	@echo "✅ Infra started"

redis:
	@echo "🔴 Starting Redis..."
	$(DOCKER_COMPOSE) up -d redis

mysql:
	@echo "🐬 Starting MySQL..."
	@if docker ps -a --format '{{.Names}}' | grep -q '^$(MYSQL_CONTAINER)$$'; then \
		docker start "$(MYSQL_CONTAINER)" >/dev/null; \
	else \
		docker run --name "$(MYSQL_CONTAINER)" \
			-e MYSQL_ROOT_PASSWORD="$(MYSQL_ROOT_PASSWORD)" \
			-e MYSQL_DATABASE="$(MYSQL_DATABASE)" \
			-p 3306:3306 \
			-d mysql:8 >/dev/null; \
	fi
	@echo "⏳ Waiting for MySQL to be ready..."
	@for i in {1..40}; do \
		if docker exec "$(MYSQL_CONTAINER)" mysqladmin ping -uroot -p$(MYSQL_ROOT_PASSWORD) --silent >/dev/null 2>&1; then \
			echo "✅ MySQL is ready"; \
			exit 0; \
		fi; \
		sleep 2; \
	done; \
	echo "❌ MySQL did not become ready in time"; \
	exit 1

runner-images:
	@echo "🐳 Building C++ runner image..."
	@printf 'FROM gcc:13-bookworm\nWORKDIR /app\nRUN useradd -m runner\nUSER runner\nCMD ["bash"]\n' | docker build -t cpp-runner -f - .
	@echo "🐳 Building Python runner image..."
	@printf 'FROM python:3.12-slim\nWORKDIR /app\nRUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*\nRUN useradd -m runner\nUSER runner\nCMD ["bash"]\n' | docker build -t python-runner -f - .
	@echo "🐳 Building Java runner image..."
	@printf 'FROM eclipse-temurin:17-jdk\nWORKDIR /app\nRUN useradd -m runner\nUSER runner\nCMD ["bash"]\n' | docker build -t java-runner -f - .
	@echo "✅ Runner images ready"

start: infra runner-images
	@mkdir -p "$(LOG_DIR)" "$(PID_DIR)"
	@echo "🚀 Starting Spring Boot backend..."
	@if [ -f "$(PID_DIR)/backend.pid" ] && kill -0 $$(cat "$(PID_DIR)/backend.pid") 2>/dev/null; then \
		echo "Backend already running"; \
	else \
		(cd "$(BACKEND_DIR)" && nohup mvn spring-boot:run > "$(LOG_DIR)/backend.log" 2>&1 & echo $$! > "$(PID_DIR)/backend.pid"); \
	fi
	@echo "⏳ Waiting for backend startup..."
	@sleep 8
	@echo "🚀 Starting Go judge service..."
	@if [ -f "$(PID_DIR)/judge.pid" ] && kill -0 $$(cat "$(PID_DIR)/judge.pid") 2>/dev/null; then \
		echo "Judge already running"; \
	else \
		(cd "$(JUDGE_DIR)" && nohup go run . > "$(LOG_DIR)/judge.log" 2>&1 & echo $$! > "$(PID_DIR)/judge.pid"); \
	fi
	@echo "🚀 Starting React frontend..."
	@if [ -f "$(PID_DIR)/frontend.pid" ] && kill -0 $$(cat "$(PID_DIR)/frontend.pid") 2>/dev/null; then \
		echo "Frontend already running"; \
	else \
		(cd "$(FRONTEND_DIR)" && nohup npm run dev -- --host 0.0.0.0 > "$(LOG_DIR)/frontend.log" 2>&1 & echo $$! > "$(PID_DIR)/frontend.pid"); \
	fi
	@echo ""
	@echo "✅ CodeForge started"
	@$(MAKE) urls

run: start

backend:
	cd "$(BACKEND_DIR)" && mvn spring-boot:run

judge:
	cd "$(JUDGE_DIR)" && go run .

frontend:
	cd "$(FRONTEND_DIR)" && npm run dev

stop: stop-app stop-infra
	@echo "✅ Full project stopped"

stop-app:
	@echo "🛑 Stopping app processes..."
	@if [ -f "$(PID_DIR)/frontend.pid" ]; then kill $$(cat "$(PID_DIR)/frontend.pid") 2>/dev/null || true; rm -f "$(PID_DIR)/frontend.pid"; fi
	@if [ -f "$(PID_DIR)/judge.pid" ]; then kill $$(cat "$(PID_DIR)/judge.pid") 2>/dev/null || true; rm -f "$(PID_DIR)/judge.pid"; fi
	@if [ -f "$(PID_DIR)/backend.pid" ]; then kill $$(cat "$(PID_DIR)/backend.pid") 2>/dev/null || true; rm -f "$(PID_DIR)/backend.pid"; fi
	@echo "✅ App processes stopped"

stop-infra:
	@echo "🛑 Stopping infra..."
	@$(DOCKER_COMPOSE) down || true
	@docker stop "$(MYSQL_CONTAINER)" >/dev/null 2>&1 || true
	@echo "✅ Infra stopped"

restart: stop start

status:
	@echo ""
	@echo "Docker containers:"
	@docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'codeforge|redis|mysql' || true
	@echo ""
	@echo "App processes:"
	@if [ -f "$(PID_DIR)/backend.pid" ] && kill -0 $$(cat "$(PID_DIR)/backend.pid") 2>/dev/null; then echo "Backend:  running on 8080"; else echo "Backend:  stopped"; fi
	@if [ -f "$(PID_DIR)/judge.pid" ] && kill -0 $$(cat "$(PID_DIR)/judge.pid") 2>/dev/null; then echo "Judge:    running on 8081"; else echo "Judge:    stopped"; fi
	@if [ -f "$(PID_DIR)/frontend.pid" ] && kill -0 $$(cat "$(PID_DIR)/frontend.pid") 2>/dev/null; then echo "Frontend: running on 5173"; else echo "Frontend: stopped"; fi
	@echo ""

logs:
	@mkdir -p "$(LOG_DIR)"
	@touch "$(LOG_DIR)/backend.log" "$(LOG_DIR)/judge.log" "$(LOG_DIR)/frontend.log"
	tail -f "$(LOG_DIR)/backend.log" "$(LOG_DIR)/judge.log" "$(LOG_DIR)/frontend.log"

backend-log:
	tail -f "$(LOG_DIR)/backend.log"

judge-log:
	tail -f "$(LOG_DIR)/judge.log"

frontend-log:
	tail -f "$(LOG_DIR)/frontend.log"

urls:
	@echo ""
	@echo "Frontend:      http://localhost:5173"
	@echo "Backend API:   http://localhost:8080/api"
	@echo "Judge Health:  http://localhost:8081/health"
	@echo "Faculty:       http://localhost:5173/faculty"
	@echo "Test Access:   http://localhost:5173/test-access"
	@echo ""

open:
	open http://localhost:5173

clean:
	rm -rf "$(LOG_DIR)" "$(PID_DIR)"
	@echo "✅ Logs and PID files removed"