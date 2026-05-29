package com.coding.codeforge.service;

import com.coding.codeforge.DTO.JudgeJob;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class RedisJudgeClientService {

    private static final String QUEUE_NAME = "codeforge:judge:queue";
    private static final String RESULT_PREFIX = "codeforge:judge:result:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisJudgeClientService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public ExecutionResultService runCode(String language, String code, String input) {
        try {
            String jobId = UUID.randomUUID().toString();

            JudgeJob job = new JudgeJob(jobId, language, code, input);
            String jobJson = objectMapper.writeValueAsString(job);

            System.out.println("🔥 Pushing job to Redis: " + jobId);

            redisTemplate.opsForList().rightPush(QUEUE_NAME, jobJson);

            String resultKey = RESULT_PREFIX + jobId;

            long start = System.currentTimeMillis();
            long timeoutMs = 10000;

            while (System.currentTimeMillis() - start < timeoutMs) {
                String resultJson = redisTemplate.opsForValue().get(resultKey);

                if (resultJson != null) {
                    redisTemplate.delete(resultKey);

                    RedisJudgeResult result = objectMapper.readValue(resultJson, RedisJudgeResult.class);

                    return new ExecutionResultService(
                            result.getStatus(),
                            result.getOutput() == null ? "" : result.getOutput(),
                            result.getError() == null ? "" : result.getError()
                    );
                }

                Thread.sleep(100);
            }

            return new ExecutionResultService("TLE", "", "Judge queue timeout");

        } catch (Exception e) {
            return new ExecutionResultService("RE", "", "Redis judge error: " + e.getMessage());
        }
    }

    public static class RedisJudgeResult {
        private String jobId;
        private String status;
        private String output;
        private String error;
        private long timeMs;

        public RedisJudgeResult() {}

        public String getJobId() {
            return jobId;
        }

        public void setJobId(String jobId) {
            this.jobId = jobId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getOutput() {
            return output;
        }

        public void setOutput(String output) {
            this.output = output;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }

        public long getTimeMs() {
            return timeMs;
        }

        public void setTimeMs(long timeMs) {
            this.timeMs = timeMs;
        }
    }
}