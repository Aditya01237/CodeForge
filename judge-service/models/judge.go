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

type BatchRunRequest struct {
	Language string   `json:"language"`
	Code     string   `json:"code"`
	Inputs   []string `json:"inputs"`
}

type BatchRunResponse struct {
	Results []RunResponse `json:"results"`
}

type JudgeJob struct {
	JobID    string   `json:"jobId"`
	Language string   `json:"language"`
	Code     string   `json:"code"`
	Inputs   []string `json:"inputs"`
}

type JudgeResult struct {
	JobID   string        `json:"jobId"`
	Results []RunResponse `json:"results"`
}
