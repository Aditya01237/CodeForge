package com.coding.codeforge.DTO;

public class JudgeJob {
    private String jobId;
    private String language;
    private String code;
    private String input;

    public JudgeJob() {}

    public JudgeJob(String jobId, String language, String code, String input) {
        this.jobId = jobId;
        this.language = language;
        this.code = code;
        this.input = input;
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

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }
}