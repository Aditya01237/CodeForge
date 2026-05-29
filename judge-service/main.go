package main

import (
	"encoding/json"
	"log"
	"net/http"

	"codeforge-judge/models"
	"codeforge-judge/runner"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "judge-service running",
	})
}

func runHandler(w http.ResponseWriter, r *http.Request) {
	var req models.RunRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	log.Println("🔥 Go Judge received request:", req.Language)

	resp := runner.RunCode(req)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/run", runHandler)

	log.Println("Go judge service running on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}
