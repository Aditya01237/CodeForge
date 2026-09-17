package com.coding.codeforge.DTO;

import java.util.List;

public class JudgeJob {
    private String jobId;
    private String language;
    private String code;
    private List<JudgeTestCase> testCases;

    public JudgeJob() {}

    public JudgeJob(String jobId, String language, String code, List<JudgeTestCase> testCases) {
        this.jobId = jobId;
        this.language = language;
        this.code = code;
        this.testCases = testCases;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public List<JudgeTestCase> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<JudgeTestCase> testCases) {
        this.testCases = testCases;
    }

    public static class JudgeTestCase {
        private int testCaseId;
        private String input;

        public JudgeTestCase() {}

        public JudgeTestCase(int testCaseId, String input) {
            this.testCaseId = testCaseId;
            this.input = input;
        }

        public int getTestCaseId() {
            return testCaseId;
        }

        public void setTestCaseId(int testCaseId) {
            this.testCaseId = testCaseId;
        }

        public String getInput() {
            return input;
        }

        public void setInput(String input) {
            this.input = input;
        }
    }
}
