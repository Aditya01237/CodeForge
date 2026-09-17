package worker

import (
	"context"
	"encoding/json"
	"log"
	"os"
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
		Addr:     "127.0.0.1:6379",
		Password: os.Getenv("REDIS_PASSWORD"),
	})

	log.Println("🔥 Redis judge worker started")

	for {
		result, err := rdb.BLPop(ctx, 0*time.Second, queueName).Result()
		if err != nil {
			log.Println("Redis BLPop error:", err)
			time.Sleep(time.Second)
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

		log.Println(
			"🔥 Processing submission job:",
			job.JobID,
			"language:",
			job.Language,
			"test cases:",
			len(job.TestCases),
		)

		runReq := models.BatchRunRequest{
			Language:  job.Language,
			Code:      job.Code,
			TestCases: job.TestCases,
		}

		runResp := runner.RunBatch(runReq)

		judgeResult := models.JudgeResult{
			JobID:         job.JobID,
			Status:        runResp.Status,
			Error:         runResp.Error,
			CompileTimeMs: runResp.CompileTimeMs,
			TimeMs:        runResp.TimeMs,
			Results:       runResp.Results,
		}

		resultBytes, _ := json.Marshal(judgeResult)

		resultKey := resultPrefix + job.JobID

		err = rdb.Set(ctx, resultKey, string(resultBytes), 2*time.Minute).Err()
		if err != nil {
			log.Println("Failed to store result:", err)
			continue
		}

		log.Println("✅ Job completed:", job.JobID, "status:", runResp.Status)
	}
}
