package com.coding.codeforge.service;

import com.coding.codeforge.DTO.JudgeJob;
import com.coding.codeforge.entity.TestCaseEntity;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class JudgeServiceTest {

    @Test
    void sendsOneBatchJobForAllSampleCases() {
        RecordingJudgeClient client = new RecordingJudgeClient();
        JudgeService judgeService = new JudgeService(client);
        List<TestCaseEntity> testCases = List.of(
                testCase("1\n", "2\n"),
                testCase("2\n", "4\n"),
                testCase("3\n", "6\n")
        );

        client.nextResult = batch(
                result(1, "OK", "2\n"),
                result(2, "OK", "4\n"),
                result(3, "OK", "6\n")
        );

        List<Map<String, Object>> results = judgeService.runTestCases("cpp", "code", testCases);

        assertEquals(3, results.size());
        assertEquals(1, client.calls);
        assertEquals("cpp", client.language);
        assertEquals("code", client.code);
        assertEquals(List.of("1\n", "2\n", "3\n"),
                client.testCases.stream().map(JudgeJob.JudgeTestCase::getInput).toList());
    }

    @Test
    void evaluatesEveryHiddenCaseAndScoresActualPasses() {
        RecordingJudgeClient client = new RecordingJudgeClient();
        JudgeService judgeService = new JudgeService(client);
        List<TestCaseEntity> testCases = List.of(
                testCase("one", "pass"),
                testCase("two", "pass"),
                testCase("three", "pass"),
                testCase("four", "pass")
        );

        client.nextResult = batch(
                result(1, "OK", "pass"),
                result(2, "OK", "wrong"),
                result(3, "OK", "pass"),
                result(4, "OK", "pass")
        );

        Map<String, Object> result = judgeService.submitTestCases("java", "code", testCases);

        assertEquals("Wrong Answer", result.get("status"));
        assertEquals(3, result.get("passedTestCases"));
        assertEquals(4, result.get("totalTestCases"));
        assertEquals(75, result.get("score"));
        assertEquals(2, result.get("failedTestCase"));
        assertFalse(result.containsKey("output"));
        assertFalse(result.containsKey("expected"));
        assertEquals(1, client.calls);
        assertEquals(4, client.testCases.size());
    }

    private static BatchExecutionResultService batch(
            BatchExecutionResultService.TestCaseExecutionResult... results
    ) {
        return new BatchExecutionResultService(
                "OK",
                "",
                10,
                20,
                List.of(results)
        );
    }

    private static BatchExecutionResultService.TestCaseExecutionResult result(
            int id,
            String status,
            String output
    ) {
        return new BatchExecutionResultService.TestCaseExecutionResult(
                id,
                status,
                output,
                "",
                1
        );
    }

    private static TestCaseEntity testCase(String input, String expected) {
        TestCaseEntity testCase = new TestCaseEntity();
        testCase.setInputData(input);
        testCase.setExpectedOutput(expected);
        return testCase;
    }

    private static final class RecordingJudgeClient extends RedisJudgeClientService {
        private BatchExecutionResultService nextResult;
        private int calls;
        private String language;
        private String code;
        private List<JudgeJob.JudgeTestCase> testCases = List.of();

        private RecordingJudgeClient() {
            super(null, null);
        }

        @Override
        public BatchExecutionResultService runBatch(
                String language,
                String code,
                List<JudgeJob.JudgeTestCase> testCases
        ) {
            this.calls++;
            this.language = language;
            this.code = code;
            this.testCases = List.copyOf(testCases);
            return nextResult;
        }
    }
}
