package runner

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"codeforge-judge/models"
)

const (
	CompileErrorExitCode = 100
	TimeLimitExitCode    = 124
)

func RunCode(req models.RunRequest) models.RunResponse {
	start := time.Now()

	tempDir, err := os.MkdirTemp("", "codeforge-*")
	if err != nil {
		return models.RunResponse{
			Status: "RE",
			Output: "",
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

		// Important:
		// compile_error.txt is written inside /app, which is the mounted host tempDir.
		// If compilation fails, we cat the error and exit with 100.
		runCommand = `
g++ /app/Main.cpp -O2 -std=c++17 -o /app/main 2> /app/compile_error.txt
compile_status=$?
if [ $compile_status -ne 0 ]; then
  cat /app/compile_error.txt
  exit 100
fi
timeout 2s /app/main < /app/input.txt
`

	case "python":
		codeFile = "main.py"
		imageName = "python-runner"

		// Python syntax/runtime errors go to stderr and CombinedOutput captures them.
		runCommand = `
timeout 2s python3 /app/main.py < /app/input.txt
`

	case "java":
		codeFile = "Main.java"
		imageName = "java-runner"

		// Java compile errors are also captured and returned as CE.
		runCommand = `
javac /app/Main.java -d /app 2> /app/compile_error.txt
compile_status=$?
if [ $compile_status -ne 0 ]; then
  cat /app/compile_error.txt
  exit 100
fi
timeout 2s java -cp /app Main < /app/input.txt
`

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
			Output: "",
			Error:  err.Error(),
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	if err := os.WriteFile(inputPath, []byte(req.Input), 0644); err != nil {
		return models.RunResponse{
			Status: "RE",
			Output: "",
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
	outputText := string(out)

	if ctx.Err() == context.DeadlineExceeded {
		return models.RunResponse{
			Status: "TLE",
			Output: "",
			Error:  "Time Limit Exceeded",
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	if err != nil {
		exitCode := -1

		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		}

		if exitCode == CompileErrorExitCode {
			return models.RunResponse{
				Status: "CE",
				Output: "",
				Error:  outputText,
				TimeMs: time.Since(start).Milliseconds(),
			}
		}

		if exitCode == TimeLimitExitCode {
			return models.RunResponse{
				Status: "TLE",
				Output: "",
				Error:  "Time Limit Exceeded",
				TimeMs: time.Since(start).Milliseconds(),
			}
		}

		return models.RunResponse{
			Status: "RE",
			Output: outputText,
			Error:  outputText,
			TimeMs: time.Since(start).Milliseconds(),
		}
	}

	return models.RunResponse{
		Status: "OK",
		Output: outputText,
		Error:  "",
		TimeMs: time.Since(start).Milliseconds(),
	}
}
