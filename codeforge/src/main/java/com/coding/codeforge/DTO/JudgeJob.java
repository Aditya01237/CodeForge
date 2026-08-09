package com.coding.codeforge.DTO;

import java.util.List;

public class JudgeJob {
    private String jobId;
    private String language;
    private String code;
    private List<String> inputs;

    public JudgeJob() {}

    public JudgeJob(String jobId, String language, String code, List<String> inputs) {
        this.jobId = jobId;
        this.language = language;
        this.code = code;
        this.inputs = inputs;
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

    public List<String> getInputs() {
        return inputs;
    }

    public void setInputs(List<String> inputs) {
        this.inputs = inputs;
    }
}
