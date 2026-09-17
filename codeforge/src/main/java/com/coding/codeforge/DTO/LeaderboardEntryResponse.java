package com.coding.codeforge.DTO;

import java.time.LocalDateTime;

public class LeaderboardEntryResponse {

    private Integer rank;
    private Long participantId;
    private String displayName;
    private String rollNumber;
    private String status;
    private Integer solvedCount;
    private Integer attemptedCount;
    private Integer totalScore;
    private Integer maxScore;
    private LocalDateTime latestSubmittedAt;

    public LeaderboardEntryResponse() {}

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getSolvedCount() {
        return solvedCount;
    }

    public void setSolvedCount(Integer solvedCount) {
        this.solvedCount = solvedCount;
    }

    public Integer getAttemptedCount() {
        return attemptedCount;
    }

    public void setAttemptedCount(Integer attemptedCount) {
        this.attemptedCount = attemptedCount;
    }

    public Integer getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }

    public LocalDateTime getLatestSubmittedAt() {
        return latestSubmittedAt;
    }

    public void setLatestSubmittedAt(LocalDateTime latestSubmittedAt) {
        this.latestSubmittedAt = latestSubmittedAt;
    }
}
