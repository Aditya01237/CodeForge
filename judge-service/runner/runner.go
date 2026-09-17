package runner

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"codeforge-judge/models"
)

const (
	CompileErrorExitCode = 100
	TimeLimitExitCode    = 124
	MaxCodeBytes         = 100_000
	MaxInputBytes        = 100_000
	MaxTotalInputBytes   = 2_000_000
	MaxOutputBytes       = 1_000_000
	MaxTestCases         = 50
)

const (
	containerStartTimeout = 10 * time.Second
	compileTimeout        = 12 * time.Second
	testTimeout           = 3 * time.Second
)

type limitedWriter struct {
	mu        sync.Mutex
	buffer    bytes.Buffer
	maxBytes  int
	truncated bool
}

func (writer *limitedWriter) Write(data []byte) (int, error) {
	writer.mu.Lock()
	defer writer.mu.Unlock()

	originalLength := len(data)
	remaining := writer.maxBytes - writer.buffer.Len()

	if remaining <= 0 {
		writer.truncated = true
		return originalLength, nil
	}

	if len(data) > remaining {
		data = data[:remaining]
		writer.truncated = true
	}

	_, _ = writer.buffer.Write(data)
	return originalLength, nil
}

func (writer *limitedWriter) String() string {
	writer.mu.Lock()
	defer writer.mu.Unlock()

	output := writer.buffer.String()
	if writer.truncated {
		output += "\n[output truncated]"
	}
	return output
}

func (writer *limitedWriter) WasTruncated() bool {
	writer.mu.Lock()
	defer writer.mu.Unlock()
	return writer.truncated
}

type languageConfig struct {
	codeFile       string
	imageName      string
	compileCommand string
	runCommand     string
}

type commandResult struct {
	output    string
	exitCode  int
	timedOut  bool
	truncated bool
	timeMs    int64
}

func RunCode(req models.RunRequest) models.RunResponse {
	batch := RunBatch(models.BatchRunRequest{
		Language: req.Language,
		Code:     req.Code,
		TestCases: []models.TestCase{
			{TestCaseID: 1, Input: req.Input},
		},
	})

	if batch.Status != "OK" {
		return models.RunResponse{
			Status: batch.Status,
			Output: "",
			Error:  batch.Error,
			TimeMs: batch.TimeMs,
		}
	}

	if len(batch.Results) == 0 {
		return models.RunResponse{
			Status: "RE",
			Output: "",
			Error:  "Judge returned no test-case result",
			TimeMs: batch.TimeMs,
		}
	}

	result := batch.Results[0]
	return models.RunResponse{
		Status: result.Status,
		Output: result.Output,
		Error:  result.Error,
		TimeMs: result.TimeMs,
	}
}

func RunBatch(req models.BatchRunRequest) models.BatchRunResponse {
	start := time.Now()

	if len(req.Code) == 0 || len(req.Code) > MaxCodeBytes {
		return invalidBatchRequest(start, "Code must be between 1 and 100000 bytes")
	}

	if len(req.TestCases) == 0 || len(req.TestCases) > MaxTestCases {
		return invalidBatchRequest(start, "A submission must contain between 1 and 50 test cases")
	}

	totalInputBytes := 0
	seenTestCaseIDs := make(map[int]struct{}, len(req.TestCases))
	for _, testCase := range req.TestCases {
		if testCase.TestCaseID <= 0 {
			return invalidBatchRequest(start, "Test-case ids must be positive")
		}
		if _, exists := seenTestCaseIDs[testCase.TestCaseID]; exists {
			return invalidBatchRequest(start, "Test-case ids must be unique")
		}
		seenTestCaseIDs[testCase.TestCaseID] = struct{}{}

		if len(testCase.Input) > MaxInputBytes {
			return invalidBatchRequest(
				start,
				fmt.Sprintf("Input for test case %d exceeds 100000 bytes", testCase.TestCaseID),
			)
		}
		totalInputBytes += len(testCase.Input)
	}

	if totalInputBytes > MaxTotalInputBytes {
		return invalidBatchRequest(start, "Combined test-case input cannot exceed 2000000 bytes")
	}

	config, supported := getLanguageConfig(req.Language)
	if !supported {
		return models.BatchRunResponse{
			Status:  "UNSUPPORTED_LANGUAGE",
			Error:   "Supported languages: cpp, python, java",
			TimeMs:  time.Since(start).Milliseconds(),
			Results: []models.TestCaseResult{},
		}
	}

	tempDir, err := os.MkdirTemp("", "codeforge-*")
	if err != nil {
		return models.BatchRunResponse{
			Status:  "RE",
			Error:   err.Error(),
			TimeMs:  time.Since(start).Milliseconds(),
			Results: []models.TestCaseResult{},
		}
	}
	defer removeTempDir(tempDir)

	if err := os.Chmod(tempDir, 0777); err != nil {
		return models.BatchRunResponse{
			Status:  "RE",
			Error:   err.Error(),
			TimeMs:  time.Since(start).Milliseconds(),
			Results: []models.TestCaseResult{},
		}
	}

	codePath := filepath.Join(tempDir, config.codeFile)

	if err := os.WriteFile(codePath, []byte(req.Code), 0644); err != nil {
		return models.BatchRunResponse{
			Status:  "RE",
			Error:   err.Error(),
			TimeMs:  time.Since(start).Milliseconds(),
			Results: []models.TestCaseResult{},
		}
	}

	containerName := "codeforge-run-" + filepath.Base(tempDir)
	if startError := startContainer(containerName, tempDir, config.imageName); startError != "" {
		return models.BatchRunResponse{
			Status:  "RE",
			Error:   startError,
			TimeMs:  time.Since(start).Milliseconds(),
			Results: []models.TestCaseResult{},
		}
	}

	defer func() {
		cleanupContext, cleanupCancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cleanupCancel()
		_ = exec.CommandContext(cleanupContext, "docker", "rm", "-f", containerName).Run()
	}()

	compileResult := runContainerCommand(
		containerName,
		config.compileCommand,
		nil,
		compileTimeout,
		"1000:1000",
	)
	if compileResult.timedOut {
		return models.BatchRunResponse{
			Status:        "CE",
			Error:         "Compilation timed out",
			CompileTimeMs: compileResult.timeMs,
			TimeMs:        time.Since(start).Milliseconds(),
			Results:       []models.TestCaseResult{},
		}
	}
	if compileResult.exitCode != 0 {
		return models.BatchRunResponse{
			Status:        "CE",
			Error:         compileResult.output,
			CompileTimeMs: compileResult.timeMs,
			TimeMs:        time.Since(start).Milliseconds(),
			Results:       []models.TestCaseResult{},
		}
	}

	if err := freezeAppDirectory(tempDir); err != nil {
		return models.BatchRunResponse{
			Status:        "RE",
			Error:         "Failed to protect compiled artifacts: " + err.Error(),
			CompileTimeMs: compileResult.timeMs,
			TimeMs:        time.Since(start).Milliseconds(),
			Results:       []models.TestCaseResult{},
		}
	}

	results := make([]models.TestCaseResult, 0, len(req.TestCases))
	for _, testCase := range req.TestCases {
		runResult := runContainerCommand(
			containerName,
			"timeout --kill-after=0.2s 2s "+config.runCommand,
			[]byte(testCase.Input),
			testTimeout,
			"1000:1000",
		)
		results = append(results, toTestCaseResult(testCase.TestCaseID, runResult))
		cleanupContainerRuntime(containerName)
	}

	return models.BatchRunResponse{
		Status:        "OK",
		Error:         "",
		CompileTimeMs: compileResult.timeMs,
		TimeMs:        time.Since(start).Milliseconds(),
		Results:       results,
	}
}

func getLanguageConfig(language string) (languageConfig, bool) {
	switch language {
	case "cpp":
		return languageConfig{
			codeFile:       "Main.cpp",
			imageName:      "cpp-runner",
			compileCommand: "g++ /app/Main.cpp -O2 -std=c++17 -o /app/main",
			runCommand:     "/app/main",
		}, true
	case "python":
		return languageConfig{
			codeFile:       "main.py",
			imageName:      "python-runner",
			compileCommand: "python3 -m py_compile /app/main.py",
			runCommand:     "python3 /app/main.py",
		}, true
	case "java":
		return languageConfig{
			codeFile:       "Main.java",
			imageName:      "java-runner",
			compileCommand: "javac /app/Main.java -d /app",
			runCommand:     "java -cp /app Main",
		}, true
	default:
		return languageConfig{}, false
	}
}

func startContainer(containerName, tempDir, imageName string) string {
	ctx, cancel := context.WithTimeout(context.Background(), containerStartTimeout)
	defer cancel()

	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "-d", "--rm",
		"--name", containerName,
		"--init",
		"--memory=256m",
		"--memory-swap=256m",
		"--cpus=1",
		"--pids-limit=64",
		"--ulimit", "nofile=64:64",
		"--ulimit", "nproc=64:64",
		"--network=none",
		"--cap-drop=ALL",
		"--security-opt=no-new-privileges",
		"--read-only",
		"--tmpfs", "/tmp:rw,nosuid,nodev,noexec,size=32m",
		"--user=0:0",
		"--mount", "type=bind,source="+tempDir+",target=/app",
		imageName,
		"bash", "-c",
		"while :; do sleep 3600; done",
	)

	output, err := cmd.CombinedOutput()
	if ctx.Err() == context.DeadlineExceeded {
		return "Timed out while creating the execution container"
	}
	if err != nil {
		return "Failed to create execution container: " + string(output)
	}
	return ""
}

func runContainerCommand(
	containerName string,
	shellCommand string,
	stdin []byte,
	timeout time.Duration,
	user string,
) commandResult {
	start := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(
		ctx,
		"docker", "exec", "-i",
		"--user", user,
		containerName,
		"bash", "-c",
		shellCommand,
	)
	if stdin != nil {
		cmd.Stdin = bytes.NewReader(stdin)
	}

	capturedOutput := &limitedWriter{maxBytes: MaxOutputBytes}
	cmd.Stdout = capturedOutput
	cmd.Stderr = capturedOutput

	err := cmd.Run()
	exitCode := 0
	if err != nil {
		exitCode = -1
		if exitError, ok := err.(*exec.ExitError); ok {
			exitCode = exitError.ExitCode()
		}
	}

	return commandResult{
		output:    capturedOutput.String(),
		exitCode:  exitCode,
		timedOut:  ctx.Err() == context.DeadlineExceeded,
		truncated: capturedOutput.WasTruncated(),
		timeMs:    time.Since(start).Milliseconds(),
	}
}

func toTestCaseResult(testCaseID int, result commandResult) models.TestCaseResult {
	response := models.TestCaseResult{
		TestCaseID: testCaseID,
		Status:     "OK",
		Output:     result.output,
		Error:      "",
		TimeMs:     result.timeMs,
	}

	if result.truncated {
		response.Status = "OLE"
		response.Error = "Output limit exceeded"
		return response
	}

	if result.timedOut || result.exitCode == TimeLimitExitCode || result.exitCode == 137 {
		response.Status = "TLE"
		response.Output = ""
		response.Error = "Time Limit Exceeded"
		return response
	}

	if result.exitCode != 0 {
		response.Status = "RE"
		response.Error = result.output
		return response
	}

	return response
}

func freezeAppDirectory(tempDir string) error {
	return filepath.Walk(tempDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return os.Chmod(path, 0555)
		}
		if info.Mode()&0111 != 0 {
			return os.Chmod(path, 0555)
		}
		return os.Chmod(path, 0444)
	})
}

func cleanupContainerRuntime(containerName string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	cleanupCommand := `
for status_file in /proc/[0-9]*/status; do
  [ -r "$status_file" ] || continue
  uid=$(awk '/^Uid:/{print $2}' "$status_file")
  if [ "$uid" = "1000" ]; then
    pid=${status_file#/proc/}
    pid=${pid%/status}
    kill -KILL "$pid" 2>/dev/null || true
  fi
done
find /tmp -mindepth 1 -delete 2>/dev/null || true
`
	_ = exec.CommandContext(
		ctx,
		"docker", "exec", "--user", "0:0",
		containerName,
		"bash", "-c", cleanupCommand,
	).Run()
}

func removeTempDir(tempDir string) {
	_ = filepath.Walk(tempDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			_ = os.Chmod(path, 0700)
		} else {
			_ = os.Chmod(path, 0600)
		}
		return nil
	})
	_ = os.RemoveAll(tempDir)
}

func invalidBatchRequest(start time.Time, message string) models.BatchRunResponse {
	return models.BatchRunResponse{
		Status:  "INVALID_REQUEST",
		Error:   message,
		TimeMs:  time.Since(start).Milliseconds(),
		Results: []models.TestCaseResult{},
	}
}
