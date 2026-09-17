package models

type RunRequest struct {
	Language string `json:"language"`
	Code     string `json:"code"`
	Input    string `json:"input"`
}

type RunResponse struct {
	Status string `json:"status"`
	Output string `json:"output"`
	Error  string `json:"error"`
	TimeMs int64  `json:"timeMs"`
}

type TestCase struct {
	TestCaseID int    `json:"testCaseId"`
	Input      string `json:"input"`
}

type BatchRunRequest struct {
	Language  string     `json:"language"`
	Code      string     `json:"code"`
	TestCases []TestCase `json:"testCases"`
}

type TestCaseResult struct {
	TestCaseID int    `json:"testCaseId"`
	Status     string `json:"status"`
	Output     string `json:"output"`
	Error      string `json:"error"`
	TimeMs     int64  `json:"timeMs"`
}

type BatchRunResponse struct {
	Status        string           `json:"status"`
	Error         string           `json:"error"`
	CompileTimeMs int64            `json:"compileTimeMs"`
	TimeMs        int64            `json:"timeMs"`
	Results       []TestCaseResult `json:"results"`
}

type JudgeJob struct {
	JobID     string     `json:"jobId"`
	Language  string     `json:"language"`
	Code      string     `json:"code"`
	TestCases []TestCase `json:"testCases"`
}

type JudgeResult struct {
	JobID         string           `json:"jobId"`
	Status        string           `json:"status"`
	Error         string           `json:"error"`
	CompileTimeMs int64            `json:"compileTimeMs"`
	TimeMs        int64            `json:"timeMs"`
	Results       []TestCaseResult `json:"results"`
}
