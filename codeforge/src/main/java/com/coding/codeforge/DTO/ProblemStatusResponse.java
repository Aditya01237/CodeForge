package com.coding.codeforge.DTO;

import java.time.LocalDateTime;

public class ProblemStatusResponse {

    private Long problemId;
    private String problemStatus; // NOT_STARTED, ATTEMPTED, ACCEPTED

    private String lastSubmissionStatus;
    private Long latestSubmissionId;
    private Long acceptedSubmissionId;

    private Integer bestScore;
    private Integer attempts;

    private LocalDateTime lastSubmittedAt;

    public ProblemStatusResponse() {}

    public ProblemStatusResponse(Long problemId) {
        this.problemId = problemId;
        this.problemStatus = "NOT_STARTED";
        this.bestScore = 0;
        this.attempts = 0;
    }

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public String getProblemStatus() {
        return problemStatus;
    }

    public void setProblemStatus(String problemStatus) {
        this.problemStatus = problemStatus;
    }

    public String getLastSubmissionStatus() {
        return lastSubmissionStatus;
    }

    public void setLastSubmissionStatus(String lastSubmissionStatus) {
        this.lastSubmissionStatus = lastSubmissionStatus;
    }

    public Long getLatestSubmissionId() {
        return latestSubmissionId;
    }

    public void setLatestSubmissionId(Long latestSubmissionId) {
        this.latestSubmissionId = latestSubmissionId;
    }

    public Long getAcceptedSubmissionId() {
        return acceptedSubmissionId;
    }

    public void setAcceptedSubmissionId(Long acceptedSubmissionId) {
        this.acceptedSubmissionId = acceptedSubmissionId;
    }

    public Integer getBestScore() {
        return bestScore;
    }

    public void setBestScore(Integer bestScore) {
        this.bestScore = bestScore;
    }

    public Integer getAttempts() {
        return attempts;
    }

    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }

    public LocalDateTime getLastSubmittedAt() {
        return lastSubmittedAt;
    }

    public void setLastSubmittedAt(LocalDateTime lastSubmittedAt) {
        this.lastSubmittedAt = lastSubmittedAt;
    }
}