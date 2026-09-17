package com.coding.codeforge.service;

import com.coding.codeforge.DTO.JudgeJob;
import com.coding.codeforge.entity.TestCaseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JudgeService {

    private static final int MAX_SAMPLE_CASES = 10;
    private static final int MAX_HIDDEN_CASES = 50;

    private final RedisJudgeClientService redisJudgeClientService;

    public JudgeService(RedisJudgeClientService redisJudgeClientService) {
        this.redisJudgeClientService = redisJudgeClientService;
    }

    public List<Map<String, Object>> runTestCases(String language, String code, List<TestCaseEntity> testCases) {
        if (testCases.size() > MAX_SAMPLE_CASES) {
            throw new RuntimeException("Too many sample test cases");
        }

        BatchExecutionResultService batch = redisJudgeClientService.runBatch(
                language,
                code,
                toJudgeTestCases(testCases)
        );

        if (!"OK".equals(batch.getStatus())) {
            return List.of(Map.of(
                    "testCase", "Compilation",
                    "status", batch.getStatus(),
                    "output", "",
                    "error", batch.getError(),
                    "expected", ""
            ));
        }

        Map<Integer, BatchExecutionResultService.TestCaseExecutionResult> executionById =
                indexResults(batch.getResults());
        List<Map<String, Object>> results = new ArrayList<>();

        for (int index = 1; index <= testCases.size(); index++) {
            TestCaseEntity tc = testCases.get(index - 1);
            BatchExecutionResultService.TestCaseExecutionResult res =
                    executionById.getOrDefault(index, missingResult(index));
            String verdict = getVerdict(res, tc.getExpectedOutput());

            results.add(Map.of(
                    "testCase", "Test Case " + index,
                    "status", verdict,
                    "output", res.getOutput(),
                    "error", res.getError(),
                    "expected", tc.getExpectedOutput(),
                    "timeMs", res.getTimeMs()
            ));
        }

        return results;
    }

    public Map<String, Object> submitTestCases(String language, String code, List<TestCaseEntity> testCases) {
        if (testCases.size() > MAX_HIDDEN_CASES) {
            throw new RuntimeException("Too many hidden test cases");
        }

        if (testCases.isEmpty()) {
            return aggregateSubmissionResult("Accepted", null, 0, 0, "");
        }

        BatchExecutionResultService batch = redisJudgeClientService.runBatch(
                language,
                code,
                toJudgeTestCases(testCases)
        );

        if (!"OK".equals(batch.getStatus())) {
            String status = switch (batch.getStatus()) {
                case "CE" -> "Compilation Error";
                case "UNSUPPORTED_LANGUAGE" -> "Unsupported Language";
                case "INVALID_REQUEST" -> "Invalid Submission";
                case "JUDGE_TIMEOUT" -> "Judge Timeout";
                default -> "Judge Error";
            };
            return aggregateSubmissionResult(status, null, 0, testCases.size(), batch.getError());
        }

        Map<Integer, BatchExecutionResultService.TestCaseExecutionResult> executionById =
                indexResults(batch.getResults());
        int passed = 0;
        Integer firstFailedTestCase = null;
        String firstFailureVerdict = null;

        for (int index = 1; index <= testCases.size(); index++) {
            TestCaseEntity tc = testCases.get(index - 1);
            BatchExecutionResultService.TestCaseExecutionResult execution =
                    executionById.getOrDefault(index, missingResult(index));
            String verdict = getVerdict(execution, tc.getExpectedOutput());

            if ("OK".equals(verdict)) {
                passed++;
            } else if (firstFailedTestCase == null) {
                firstFailedTestCase = index;
                firstFailureVerdict = verdict;
            }
        }

        String status = firstFailedTestCase == null
                ? "Accepted"
                : submissionStatus(firstFailureVerdict);

        return aggregateSubmissionResult(
                status,
                firstFailedTestCase,
                passed,
                testCases.size(),
                ""
        );
    }

    private List<JudgeJob.JudgeTestCase> toJudgeTestCases(List<TestCaseEntity> testCases) {
        List<JudgeJob.JudgeTestCase> judgeCases = new ArrayList<>(testCases.size());

        for (int index = 0; index < testCases.size(); index++) {
            judgeCases.add(new JudgeJob.JudgeTestCase(index + 1, testCases.get(index).getInputData()));
        }

        return judgeCases;
    }

    private Map<Integer, BatchExecutionResultService.TestCaseExecutionResult> indexResults(
            List<BatchExecutionResultService.TestCaseExecutionResult> results
    ) {
        Map<Integer, BatchExecutionResultService.TestCaseExecutionResult> indexed = new HashMap<>();
        for (BatchExecutionResultService.TestCaseExecutionResult result : results) {
            indexed.put(result.getTestCaseId(), result);
        }
        return indexed;
    }

    private BatchExecutionResultService.TestCaseExecutionResult missingResult(int testCaseId) {
        return new BatchExecutionResultService.TestCaseExecutionResult(
                testCaseId,
                "JUDGE_ERROR",
                "",
                "Judge did not return a result for this test case",
                0
        );
    }

    private Map<String, Object> aggregateSubmissionResult(
            String status,
            Integer failedTestCase,
            int passed,
            int total,
            String error
    ) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", status);
        result.put("passedTestCases", passed);
        result.put("totalTestCases", total);
        result.put("score", total == 0 ? 100 : (passed * 100) / total);

        if (failedTestCase != null) {
            result.put("failedTestCase", failedTestCase);
        }
        if (error != null && !error.isBlank()) {
            result.put("error", error);
        }

        return result;
    }

    private String submissionStatus(String verdict) {
        if (verdict == null) return "Judge Error";

        return switch (verdict) {
            case "TLE" -> "Time Limit Exceeded";
            case "RE" -> "Runtime Error";
            case "OLE" -> "Output Limit Exceeded";
            case "NO_OUTPUT" -> "No Output";
            case "UNSUPPORTED_LANGUAGE" -> "Unsupported Language";
            case "JUDGE_ERROR" -> "Judge Error";
            default -> "Wrong Answer";
        };
    }

    private String getVerdict(
            BatchExecutionResultService.TestCaseExecutionResult res,
            String expectedOutput
    ) {

        if (res.getStatus().equals("CE")) return "CE";
        if (res.getStatus().equals("TLE")) return "TLE";
        if (res.getStatus().equals("RE")) return "RE";
        if (res.getStatus().equals("OLE")) return "OLE";
        if (res.getStatus().equals("UNSUPPORTED_LANGUAGE")) return "UNSUPPORTED_LANGUAGE";
        if (!res.getStatus().equals("OK")) return "JUDGE_ERROR";

        String actual = normalize(res.getOutput());
        String expected = normalize(expectedOutput);

        if (actual.isEmpty() && !expected.isEmpty()) return "NO_OUTPUT";
        if (actual.equals(expected)) return "OK";

        return "WA";
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().replaceAll("\\r", "");
    }
}
