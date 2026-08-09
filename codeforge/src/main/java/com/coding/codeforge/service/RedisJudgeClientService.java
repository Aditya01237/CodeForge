package com.coding.codeforge.service;

import com.coding.codeforge.DTO.JudgeJob;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    public List<ExecutionResultService> runTestCases(String language, String code, List<String> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            return List.of();
        }

        try {
            String jobId = UUID.randomUUID().toString();

            JudgeJob job = new JudgeJob(jobId, language, code, inputs);
            String jobJson = objectMapper.writeValueAsString(job);

            System.out.println("🔥 Pushing batch judge job to Redis: " + jobId + " tests=" + inputs.size());

            redisTemplate.opsForList().rightPush(QUEUE_NAME, jobJson);

            String resultKey = RESULT_PREFIX + jobId;

            long start = System.currentTimeMillis();
            long timeoutMs = 10_000L + (inputs.size() * 3_000L);

            while (System.currentTimeMillis() - start < timeoutMs) {
                String resultJson = redisTemplate.opsForValue().get(resultKey);

                if (resultJson != null) {
                    redisTemplate.delete(resultKey);

                    RedisJudgeResult result = objectMapper.readValue(resultJson, RedisJudgeResult.class);
                    List<ExecutionResultService> executionResults = new ArrayList<>();

                    if (result.getResults() != null) {
                        for (RedisTestResult testResult : result.getResults()) {
                            executionResults.add(new ExecutionResultService(
                                    testResult.getStatus(),
                                    testResult.getOutput() == null ? "" : testResult.getOutput(),
                                    testResult.getError() == null ? "" : testResult.getError()
                            ));
                        }
                    }

                    while (executionResults.size() < inputs.size()) {
                        executionResults.add(new ExecutionResultService(
                                "RE",
                                "",
                                "Judge returned fewer testcase results than requested"
                        ));
                    }

                    if (executionResults.size() > inputs.size()) {
                        return new ArrayList<>(executionResults.subList(0, inputs.size()));
                    }

                    return executionResults;
                }

                Thread.sleep(100);
            }

            return failureResults(inputs.size(), "TLE", "Judge batch timeout");

        } catch (Exception e) {
            return failureResults(inputs.size(), "RE", "Redis judge error: " + e.getMessage());
        }
    }

    public ExecutionResultService runCode(String language, String code, String input) {
        List<ExecutionResultService> results = runTestCases(
                language,
                code,
                List.of(input == null ? "" : input)
        );

        if (results.isEmpty()) {
            return new ExecutionResultService("RE", "", "Judge returned no result");
        }

        return results.get(0);
    }

    private List<ExecutionResultService> failureResults(int count, String status, String error) {
        List<ExecutionResultService> results = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            results.add(new ExecutionResultService(status, "", error));
        }

        return results;
    }

    public static class RedisJudgeResult {
        private String jobId;
        private List<RedisTestResult> results;

        public RedisJudgeResult() {}

        public String getJobId() {
            return jobId;
        }

        public void setJobId(String jobId) {
            this.jobId = jobId;
        }

        public List<RedisTestResult> getResults() {
            return results;
        }

        public void setResults(List<RedisTestResult> results) {
            this.results = results;
        }
    }

    public static class RedisTestResult {
        private String status;
        private String output;
        private String error;
        private long timeMs;

        public RedisTestResult() {}

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
