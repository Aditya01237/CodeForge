package com.coding.codeforge.service;

import com.coding.codeforge.DTO.JudgeJob;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
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

    public BatchExecutionResultService runBatch(
            String language,
            String code,
            List<JudgeJob.JudgeTestCase> testCases
    ) {
        try {
            String jobId = UUID.randomUUID().toString();

            JudgeJob job = new JudgeJob(jobId, language, code, testCases);
            String jobJson = objectMapper.writeValueAsString(job);

            System.out.println("🔥 Pushing submission job to Redis: " + jobId
                    + " (" + testCases.size() + " test cases)");

            redisTemplate.opsForList().rightPush(QUEUE_NAME, jobJson);

            String resultKey = RESULT_PREFIX + jobId;

            long start = System.currentTimeMillis();
            long timeoutMs = 15_000L + (testCases.size() * 3_000L);

            while (System.currentTimeMillis() - start < timeoutMs) {
                String resultJson = redisTemplate.opsForValue().get(resultKey);

                if (resultJson != null) {
                    redisTemplate.delete(resultKey);

                    RedisJudgeResult result = objectMapper.readValue(resultJson, RedisJudgeResult.class);

                    List<BatchExecutionResultService.TestCaseExecutionResult> caseResults =
                            result.getResults().stream()
                                    .map(caseResult -> new BatchExecutionResultService.TestCaseExecutionResult(
                                            caseResult.getTestCaseId(),
                                            caseResult.getStatus(),
                                            caseResult.getOutput(),
                                            caseResult.getError(),
                                            caseResult.getTimeMs()
                                    ))
                                    .toList();

                    return new BatchExecutionResultService(
                            result.getStatus(),
                            result.getError(),
                            result.getCompileTimeMs(),
                            result.getTimeMs(),
                            caseResults
                    );
                }

                Thread.sleep(100);
            }

            return judgeFailure("JUDGE_TIMEOUT", "Judge did not return the batch before the queue deadline");

        } catch (Exception e) {
            return judgeFailure("JUDGE_ERROR", "Redis judge error: " + e.getMessage());
        }
    }

    private BatchExecutionResultService judgeFailure(String status, String error) {
        return new BatchExecutionResultService(status, error, 0, 0, Collections.emptyList());
    }

    public static class RedisJudgeResult {
        private String jobId;
        private String status;
        private String error;
        private long compileTimeMs;
        private long timeMs;
        private List<RedisTestCaseResult> results = Collections.emptyList();

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

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }

        public long getCompileTimeMs() {
            return compileTimeMs;
        }

        public void setCompileTimeMs(long compileTimeMs) {
            this.compileTimeMs = compileTimeMs;
        }

        public long getTimeMs() {
            return timeMs;
        }

        public void setTimeMs(long timeMs) {
            this.timeMs = timeMs;
        }

        public List<RedisTestCaseResult> getResults() {
            return results == null ? Collections.emptyList() : results;
        }

        public void setResults(List<RedisTestCaseResult> results) {
            this.results = results;
        }
    }

    public static class RedisTestCaseResult {
        private int testCaseId;
        private String status;
        private String output;
        private String error;
        private long timeMs;

        public RedisTestCaseResult() {}

        public int getTestCaseId() {
            return testCaseId;
        }

        public void setTestCaseId(int testCaseId) {
            this.testCaseId = testCaseId;
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
