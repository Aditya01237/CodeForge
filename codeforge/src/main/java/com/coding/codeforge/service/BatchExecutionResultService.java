package com.coding.codeforge.service;

import java.util.Collections;
import java.util.List;

public class BatchExecutionResultService {
    private final String status;
    private final String error;
    private final long compileTimeMs;
    private final long timeMs;
    private final List<TestCaseExecutionResult> results;

    public BatchExecutionResultService(
            String status,
            String error,
            long compileTimeMs,
            long timeMs,
            List<TestCaseExecutionResult> results
    ) {
        this.status = status;
        this.error = error == null ? "" : error;
        this.compileTimeMs = compileTimeMs;
        this.timeMs = timeMs;
        this.results = results == null ? Collections.emptyList() : List.copyOf(results);
    }

    public String getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public long getCompileTimeMs() {
        return compileTimeMs;
    }

    public long getTimeMs() {
        return timeMs;
    }

    public List<TestCaseExecutionResult> getResults() {
        return results;
    }

    public static class TestCaseExecutionResult {
        private final int testCaseId;
        private final String status;
        private final String output;
        private final String error;
        private final long timeMs;

        public TestCaseExecutionResult(
                int testCaseId,
                String status,
                String output,
                String error,
                long timeMs
        ) {
            this.testCaseId = testCaseId;
            this.status = status;
            this.output = output == null ? "" : output;
            this.error = error == null ? "" : error;
            this.timeMs = timeMs;
        }

        public int getTestCaseId() {
            return testCaseId;
        }

        public String getStatus() {
            return status;
        }

        public String getOutput() {
            return output;
        }

        public String getError() {
            return error;
        }

        public long getTimeMs() {
            return timeMs;
        }
    }
}
