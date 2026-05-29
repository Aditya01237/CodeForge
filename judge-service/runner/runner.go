package runner

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"codeforge-judge/models"
)

func RunCode(req models.RunRequest) models.RunResponse {
	start := time.Now()

	if req.Language != "cpp" {
		return models.RunResponse{
			Status: "UNSUPPORTED_LANGUAGE",
			Output: "",
			Error:  "Only cpp is supported today",
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	tempDir, err := os.MkdirTemp("", "codeforge-*")
	if err != nil {
		return models.RunResponse{
			Status: "RE",
			Error:  err.Error(),
			TimeMs: time.Since(start).Milliseconds(),
		}
	}
	defer os.RemoveAll(tempDir)

	codePath := filepath.Join(tempDir, "code.cpp")
	inputPath := filepath.Join(tempDir, "input.txt")

	if err := os.WriteFile(codePath, []byte(req.Code), 0644); err != nil {
		return models.RunResponse{Status: "RE", Error: err.Error()}
	}

	if err := os.WriteFile(inputPath, []byte(req.Input), 0644); err != nil {
		return models.RunResponse{Status: "RE", Error: err.Error()}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm",
		"--memory=256m",
		"--cpus=1",
		"--network=none",
		"-v", tempDir+":/app",
		"cpp-runner",
		"bash", "-c",
		"g++ /app/code.cpp -O2 -std=c++17 -o /app/code 2> /app/compile_error.txt && timeout 2s /app/code < /app/input.txt",
	)

	out, err := cmd.CombinedOutput()

	if ctx.Err() == context.DeadlineExceeded {
		return models.RunResponse{
			Status: "TLE",
			Output: "",
			Error:  "Time Limit Exceeded",
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	compileErrPath := filepath.Join(tempDir, "compile_error.txt")
	compileErr, _ := os.ReadFile(compileErrPath)

	if len(compileErr) > 0 {
		return models.RunResponse{
			Status: "CE",
			Output: "",
			Error:  string(compileErr),
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	if err != nil {
		return models.RunResponse{
			Status: "RE",
			Output: string(out),
			Error:  err.Error(),
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	return models.RunResponse{
		Status: "OK",
		Output: string(out),
		Error:  "",
		TimeMs: time.Since(start).Milliseconds(),
	}
}
