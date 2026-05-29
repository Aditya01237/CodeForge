package worker

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"codeforge-judge/models"
	"codeforge-judge/runner"

	"github.com/redis/go-redis/v9"
)

const queueName = "codeforge:judge:queue"
const resultPrefix = "codeforge:judge:result:"

func StartRedisWorker() {
	ctx := context.Background()

	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	log.Println("🔥 Redis judge worker started")

	for {
		result, err := rdb.BLPop(ctx, 0*time.Second, queueName).Result()
		if err != nil {
			log.Println("Redis BLPop error:", err)
			continue
		}

		if len(result) < 2 {
			continue
		}

		jobJson := result[1]

		var job models.JudgeJob
		if err := json.Unmarshal([]byte(jobJson), &job); err != nil {
			log.Println("Invalid job JSON:", err)
			continue
		}

		log.Println("🔥 Processing job:", job.JobID, "language:", job.Language)

		runReq := models.RunRequest{
			Language: job.Language,
			Code:     job.Code,
			Input:    job.Input,
		}

		runResp := runner.RunCode(runReq)

		judgeResult := models.JudgeResult{
			JobID:  job.JobID,
			Status: runResp.Status,
			Output: runResp.Output,
			Error:  runResp.Error,
			TimeMs: runResp.TimeMs,
		}

		resultBytes, _ := json.Marshal(judgeResult)

		resultKey := resultPrefix + job.JobID

		err = rdb.Set(ctx, resultKey, string(resultBytes), 30*time.Second).Err()
		if err != nil {
			log.Println("Failed to store result:", err)
			continue
		}

		log.Println("✅ Job completed:", job.JobID, "status:", runResp.Status)
	}
}
