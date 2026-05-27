package main

import (
	"codeforge-judge/models"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "judge-service running",
	})
}

func runHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	var req models.RunRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	resp := models.RunResponse{
		Status: "OK",
		Output: "fake output from Go judge\n",
		Error:  "",
		TimeMs: time.Since(start).Milliseconds(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/run", runHandler)
	log.Println("Go judge service running on 8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}
