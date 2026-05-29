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

	tempDir, err := os.MkdirTemp("", "codeforge-*")
	if err != nil {
		return models.RunResponse{
			Status: "RE",
			Error:  err.Error(),
			TimeMs: time.Since(start).Milliseconds(),
		}
	}
	defer os.RemoveAll(tempDir)

	var codeFile string
	var imageName string
	var runCommand string

	switch req.Language {
	case "cpp":
		codeFile = "Main.cpp"
		imageName = "cpp-runner"
		runCommand = "g++ /app/Main.cpp -O2 -std=c++17 -o /tmp/main 2> /tmp/compile_error.txt && timeout 2s /tmp/main < /app/input.txt"

	case "python":
		codeFile = "main.py"
		imageName = "python-runner"
		runCommand = "timeout 2s python3 /app/main.py < /app/input.txt"

	case "java":
		codeFile = "Main.java"
		imageName = "java-runner"
		runCommand = "javac /app/Main.java -d /tmp 2> /tmp/compile_error.txt && timeout 2s java -cp /tmp Main < /app/input.txt"

	default:
		return models.RunResponse{
			Status: "UNSUPPORTED_LANGUAGE",
			Output: "",
			Error:  "Supported languages: cpp, python, java",
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	codePath := filepath.Join(tempDir, codeFile)
	inputPath := filepath.Join(tempDir, "input.txt")

	if err := os.WriteFile(codePath, []byte(req.Code), 0644); err != nil {
		return models.RunResponse{
			Status: "RE",
			Error:  err.Error(),
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	if err := os.WriteFile(inputPath, []byte(req.Input), 0644); err != nil {
		return models.RunResponse{
			Status: "RE",
			Error:  err.Error(),
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 6*time.Second)
	defer cancel()

	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm",
		"--memory=256m",
		"--cpus=1",
		"--network=none",
		"-v", tempDir+":/app",
		imageName,
		"bash", "-c",
		runCommand,
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
