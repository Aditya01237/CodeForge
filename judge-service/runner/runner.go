package runner

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"codeforge-judge/models"
)

const (
	CompileErrorExitCode = 100
	TimeLimitExitCode    = 124
)

func RunCode(req models.RunRequest) models.RunResponse {
	batch := RunBatch(models.BatchRunRequest{
		Language: req.Language,
		Code:     req.Code,
		Inputs:   []string{req.Input},
	})

	if len(batch.Results) == 0 {
		return models.RunResponse{
			Status: "RE",
			Output: "",
			Error:  "Judge returned no result",
			TimeMs: 0,
		}
	}

	return batch.Results[0]
}

func RunBatch(req models.BatchRunRequest) models.BatchRunResponse {
	if len(req.Inputs) == 0 {
		return models.BatchRunResponse{Results: []models.RunResponse{}}
	}

	codeFile, imageName, compileCommand, runCommandForInput, supported := languageConfig(req.Language)
	if !supported {
		return models.BatchRunResponse{
			Results: repeatedResults(len(req.Inputs), models.RunResponse{
				Status: "UNSUPPORTED_LANGUAGE",
				Output: "",
				Error:  "Supported languages: cpp, python, java",
				TimeMs: 0,
			}),
		}
	}

	tempDir, err := os.MkdirTemp("", "codeforge-*")
	if err != nil {
		return models.BatchRunResponse{
			Results: repeatedResults(len(req.Inputs), models.RunResponse{
				Status: "RE",
				Output: "",
				Error:  err.Error(),
				TimeMs: 0,
			}),
		}
	}
	defer os.RemoveAll(tempDir)

	// The container only needs read access to source/input files. Compiled artifacts
	// are written inside the sandbox under /tmp and reused for every testcase.
	if err := os.Chmod(tempDir, 0755); err != nil {
		return models.BatchRunResponse{
			Results: repeatedResults(len(req.Inputs), models.RunResponse{
				Status: "RE",
				Output: "",
				Error:  err.Error(),
				TimeMs: 0,
			}),
		}
	}

	codePath := filepath.Join(tempDir, codeFile)
	if err := os.WriteFile(codePath, []byte(req.Code), 0644); err != nil {
		return models.BatchRunResponse{
			Results: repeatedResults(len(req.Inputs), models.RunResponse{
				Status: "RE",
				Output: "",
				Error:  err.Error(),
				TimeMs: 0,
			}),
		}
	}

	for i, input := range req.Inputs {
		inputPath := filepath.Join(tempDir, inputFileName(i))
		if err := os.WriteFile(inputPath, []byte(input), 0644); err != nil {
			return models.BatchRunResponse{
				Results: repeatedResults(len(req.Inputs), models.RunResponse{
					Status: "RE",
					Output: "",
					Error:  err.Error(),
					TimeMs: 0,
				}),
			}
		}
	}

	containerID, startErr := startSandbox(tempDir, imageName)
	if startErr != nil {
		return models.BatchRunResponse{
			Results: repeatedResults(len(req.Inputs), models.RunResponse{
				Status: "RE",
				Output: "",
				Error:  startErr.Error(),
				TimeMs: 0,
			}),
		}
	}
	defer removeSandbox(containerID)

	compileStart := time.Now()
	compileOut, compileErr, compileTimedOut := execInSandbox(containerID, compileCommand, 10*time.Second)
	compileTime := time.Since(compileStart).Milliseconds()

	if compileTimedOut {
		return models.BatchRunResponse{
			Results: repeatedResults(len(req.Inputs), models.RunResponse{
				Status: "CE",
				Output: "",
				Error:  "Compilation timed out",
				TimeMs: compileTime,
			}),
		}
	}

	if compileErr != nil {
		return models.BatchRunResponse{
			Results: repeatedResults(len(req.Inputs), models.RunResponse{
				Status: "CE",
				Output: "",
				Error:  string(compileOut),
				TimeMs: compileTime,
			}),
		}
	}

	results := make([]models.RunResponse, 0, len(req.Inputs))

	for i := range req.Inputs {
		started := time.Now()
		command := runCommandForInput(inputFileName(i))
		out, runErr, timedOut := execInSandbox(containerID, command, 4*time.Second)
		elapsed := time.Since(started).Milliseconds()
		outputText := string(out)

		if timedOut {
			results = append(results, models.RunResponse{
				Status: "TLE",
				Output: "",
				Error:  "Time Limit Exceeded",
				TimeMs: elapsed,
			})
			continue
		}

		if runErr != nil {
			exitCode := exitCode(runErr)

			if exitCode == TimeLimitExitCode {
				results = append(results, models.RunResponse{
					Status: "TLE",
					Output: "",
					Error:  "Time Limit Exceeded",
					TimeMs: elapsed,
				})
				continue
			}

			results = append(results, models.RunResponse{
				Status: "RE",
				Output: outputText,
				Error:  outputText,
				TimeMs: elapsed,
			})
			continue
		}

		results = append(results, models.RunResponse{
			Status: "OK",
			Output: outputText,
			Error:  "",
			TimeMs: elapsed,
		})
	}

	return models.BatchRunResponse{Results: results}
}

func languageConfig(language string) (
	codeFile string,
	imageName string,
	compileCommand string,
	runCommandForInput func(string) string,
	supported bool,
) {
	switch language {
	case "cpp":
		return "Main.cpp", "cpp-runner",
			"g++ /app/Main.cpp -O2 -std=c++17 -o /tmp/codeforge-main",
			func(inputFile string) string {
				return fmt.Sprintf("timeout 2s /tmp/codeforge-main < /app/%s", inputFile)
			},
			true

	case "java":
		return "Main.java", "java-runner",
			"mkdir -p /tmp/codeforge-classes && javac /app/Main.java -d /tmp/codeforge-classes",
			func(inputFile string) string {
				return fmt.Sprintf("timeout 2s java -cp /tmp/codeforge-classes Main < /app/%s", inputFile)
			},
			true

	case "python":
		return "main.py", "python-runner",
			"PYTHONPYCACHEPREFIX=/tmp/codeforge-pycache python3 -m py_compile /app/main.py",
			func(inputFile string) string {
				return fmt.Sprintf("timeout 2s python3 /app/main.py < /app/%s", inputFile)
			},
			true

	default:
		return "", "", "", nil, false
	}
}

func startSandbox(tempDir, imageName string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "-d", "--rm",
		"--memory=256m",
		"--cpus=1",
		"--network=none",
		"-v", tempDir+":/app:ro",
		imageName,
		"bash", "-c", "while true; do sleep 3600; done",
	)

	out, err := cmd.CombinedOutput()
	if ctx.Err() == context.DeadlineExceeded {
		return "", fmt.Errorf("sandbox startup timed out")
	}
	if err != nil {
		return "", fmt.Errorf("failed to start sandbox: %s", strings.TrimSpace(string(out)))
	}

	containerID := strings.TrimSpace(string(out))
	if containerID == "" {
		return "", fmt.Errorf("docker returned an empty container id")
	}

	return containerID, nil
}

func execInSandbox(containerID, command string, timeout time.Duration) ([]byte, error, bool) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(
		ctx,
		"docker", "exec",
		containerID,
		"bash", "-c", command,
	)

	out, err := cmd.CombinedOutput()
	return out, err, ctx.Err() == context.DeadlineExceeded
}

func removeSandbox(containerID string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = exec.CommandContext(ctx, "docker", "rm", "-f", containerID).Run()
}

func inputFileName(index int) string {
	return fmt.Sprintf("input_%04d.txt", index)
}

func exitCode(err error) int {
	if exitErr, ok := err.(*exec.ExitError); ok {
		return exitErr.ExitCode()
	}
	return -1
}

func repeatedResults(count int, result models.RunResponse) []models.RunResponse {
	results := make([]models.RunResponse, count)
	for i := range results {
		results[i] = result
	}
	return results
}
