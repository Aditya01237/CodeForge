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

type JudgeJob struct {
	JobID    string `json:"jobId"`
	Language string `json:"language"`
	Code     string `json:"code"`
	Input    string `json:"input"`
}

type JudgeResult struct {
	JobID  string `json:"jobId"`
	Status string `json:"status"`
	Output string `json:"output"`
	Error  string `json:"error"`
	TimeMs int64  `json:"timeMs"`
}
