package com.coding.codeforge.DTO;

import java.time.LocalDateTime;

public class FacultyProblemResultResponse {

    private Long problemId;
    private String problemTitle;
    private String difficulty;

    private String problemStatus; // NOT_STARTED, ATTEMPTED, ACCEPTED
    private Integer attempts;
    private Integer bestScore;

    private Long latestSubmissionId;
    private String latestSubmissionStatus;
    private LocalDateTime latestSubmittedAt;

    private Long acceptedSubmissionId;

    public FacultyProblemResultResponse() {}

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public String getProblemTitle() {
        return problemTitle;
    }

    public void setProblemTitle(String problemTitle) {
        this.problemTitle = problemTitle;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getProblemStatus() {
        return problemStatus;
    }

    public void setProblemStatus(String problemStatus) {
        this.problemStatus = problemStatus;
    }

    public Integer getAttempts() {
        return attempts;
    }

    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }

    public Integer getBestScore() {
        return bestScore;
    }

    public void setBestScore(Integer bestScore) {
        this.bestScore = bestScore;
    }

    public Long getLatestSubmissionId() {
        return latestSubmissionId;
    }

    public void setLatestSubmissionId(Long latestSubmissionId) {
        this.latestSubmissionId = latestSubmissionId;
    }

    public String getLatestSubmissionStatus() {
        return latestSubmissionStatus;
    }

    public void setLatestSubmissionStatus(String latestSubmissionStatus) {
        this.latestSubmissionStatus = latestSubmissionStatus;
    }

    public LocalDateTime getLatestSubmittedAt() {
        return latestSubmittedAt;
    }

    public void setLatestSubmittedAt(LocalDateTime latestSubmittedAt) {
        this.latestSubmittedAt = latestSubmittedAt;
    }

    public Long getAcceptedSubmissionId() {
        return acceptedSubmissionId;
    }

    public void setAcceptedSubmissionId(Long acceptedSubmissionId) {
        this.acceptedSubmissionId = acceptedSubmissionId;
    }
}