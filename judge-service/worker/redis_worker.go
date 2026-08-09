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

		jobJSON := result[1]

		var job models.JudgeJob
		if err := json.Unmarshal([]byte(jobJSON), &job); err != nil {
			log.Println("Invalid job JSON:", err)
			continue
		}

		log.Println("🔥 Processing batch job:", job.JobID, "language:", job.Language, "tests:", len(job.Inputs))

		runReq := models.BatchRunRequest{
			Language: job.Language,
			Code:     job.Code,
			Inputs:   job.Inputs,
		}

		runResp := runner.RunBatch(runReq)

		judgeResult := models.JudgeResult{
			JobID:   job.JobID,
			Results: runResp.Results,
		}

		resultBytes, err := json.Marshal(judgeResult)
		if err != nil {
			log.Println("Failed to serialize judge result:", err)
			continue
		}

		resultKey := resultPrefix + job.JobID

		err = rdb.Set(ctx, resultKey, string(resultBytes), 30*time.Second).Err()
		if err != nil {
			log.Println("Failed to store result:", err)
			continue
		}

		log.Println("✅ Batch job completed:", job.JobID, "tests:", len(runResp.Results))
	}
}
