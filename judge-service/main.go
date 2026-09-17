package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"codeforge-judge/models"
	"codeforge-judge/runner"
	"codeforge-judge/worker"
)

const maxRequestBodyBytes = 256 * 1024

var (
	directRunSlots = make(chan struct{}, 2)
	rateMu         sync.Mutex
	rateWindow     = time.Now()
	rateCount      int
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "judge-service running",
	})
}

func runHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if !allowDirectRun() {
		http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
		return
	}

	select {
	case directRunSlots <- struct{}{}:
		defer func() { <-directRunSlots }()
	default:
		http.Error(w, "judge is busy", http.StatusTooManyRequests)
		return
	}

	var req models.RunRequest

	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBodyBytes)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	resp := runner.RunCode(req)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func allowDirectRun() bool {
	rateMu.Lock()
	defer rateMu.Unlock()

	now := time.Now()
	if now.Sub(rateWindow) >= time.Minute {
		rateWindow = now
		rateCount = 0
	}

	if rateCount >= 30 {
		return false
	}

	rateCount++
	return true
}

func main() {
	go worker.StartRedisWorker()

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/run", runHandler)

	server := &http.Server{
		Addr:              "127.0.0.1:8081",
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       30 * time.Second,
		MaxHeaderBytes:    16 * 1024,
	}

	log.Println("Go judge service running on 127.0.0.1:8081")
	log.Fatal(server.ListenAndServe())
}
