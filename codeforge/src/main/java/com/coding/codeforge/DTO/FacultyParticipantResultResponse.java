package com.coding.codeforge.DTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class FacultyParticipantResultResponse {

    private Long participantId;
    private String participantType;

    private String rollNumber;
    private String name;
    private String email;
    private String identifier;

    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    private Integer solvedCount;
    private Integer attemptedCount;
    private Integer totalProblems;

    private Integer totalScore;
    private Integer maxScore;

    private Long latestSubmissionId;
    private String latestSubmissionStatus;
    private String latestSubmissionProblemTitle;
    private LocalDateTime latestSubmittedAt;

    private List<FacultyProblemResultResponse> problems = new ArrayList<>();

    public FacultyParticipantResultResponse() {}

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public String getParticipantType() {
        return participantType;
    }

    public void setParticipantType(String participantType) {
        this.participantType = participantType;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
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

    public Integer getTotalProblems() {
        return totalProblems;
    }

    public void setTotalProblems(Integer totalProblems) {
        this.totalProblems = totalProblems;
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

    public String getLatestSubmissionProblemTitle() {
        return latestSubmissionProblemTitle;
    }

    public void setLatestSubmissionProblemTitle(String latestSubmissionProblemTitle) {
        this.latestSubmissionProblemTitle = latestSubmissionProblemTitle;
    }

    public LocalDateTime getLatestSubmittedAt() {
        return latestSubmittedAt;
    }

    public void setLatestSubmittedAt(LocalDateTime latestSubmittedAt) {
        this.latestSubmittedAt = latestSubmittedAt;
    }

    public List<FacultyProblemResultResponse> getProblems() {
        return problems;
    }

    public void setProblems(List<FacultyProblemResultResponse> problems) {
        this.problems = problems;
    }
}