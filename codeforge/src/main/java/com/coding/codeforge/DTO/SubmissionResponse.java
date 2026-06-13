package com.coding.codeforge.DTO;

import java.time.LocalDateTime;

public class SubmissionResponse {

    private Long submissionId;
    private Long testId;
    private Long participantId;
    private Long problemId;

    private String language;
    private String status;

    private Integer score;
    private Integer passedTestCases;
    private Integer totalTestCases;
    private Integer failedTestCase;

    private String output;
    private String error;

    private LocalDateTime submittedAt;

    public SubmissionResponse() {}

    public SubmissionResponse(
            Long submissionId,
            Long testId,
            Long participantId,
            Long problemId,
            String language,
            String status,
            Integer score,
            Integer passedTestCases,
            Integer totalTestCases,
            Integer failedTestCase,
            String output,
            String error,
            LocalDateTime submittedAt
    ) {
        this.submissionId = submissionId;
        this.testId = testId;
        this.participantId = participantId;
        this.problemId = problemId;
        this.language = language;
        this.status = status;
        this.score = score;
        this.passedTestCases = passedTestCases;
        this.totalTestCases = totalTestCases;
        this.failedTestCase = failedTestCase;
        this.output = output;
        this.error = error;
        this.submittedAt = submittedAt;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public Long getTestId() {
        return testId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getPassedTestCases() {
        return passedTestCases;
    }

    public void setPassedTestCases(Integer passedTestCases) {
        this.passedTestCases = passedTestCases;
    }

    public Integer getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(Integer totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public Integer getFailedTestCase() {
        return failedTestCase;
    }

    public void setFailedTestCase(Integer failedTestCase) {
        this.failedTestCase = failedTestCase;
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

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}