package com.coding.codeforge.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.coding.codeforge.entity.Problem;

import java.time.LocalDateTime;

public class InterviewSessionResponse {

    private Long id;
    private String roomCode;
    private String title;
    private String interviewerName;
    private String candidateName;
    private LocalDateTime candidateJoinedAt;
    private String viewerRole;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String accessToken;
    private String meetingUrl;
    private Integer durationMinutes;
    private String status;
    private String language;
    private String code;
    private Integer feedbackRating;
    private String feedbackStrengths;
    private String feedbackImprovements;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime updatedAt;
    private Problem problem;

    public InterviewSessionResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInterviewerName() {
        return interviewerName;
    }

    public void setInterviewerName(String interviewerName) {
        this.interviewerName = interviewerName;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public LocalDateTime getCandidateJoinedAt() {
        return candidateJoinedAt;
    }

    public void setCandidateJoinedAt(LocalDateTime candidateJoinedAt) {
        this.candidateJoinedAt = candidateJoinedAt;
    }

    public String getViewerRole() {
        return viewerRole;
    }

    public void setViewerRole(String viewerRole) {
        this.viewerRole = viewerRole;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getMeetingUrl() {
        return meetingUrl;
    }

    public void setMeetingUrl(String meetingUrl) {
        this.meetingUrl = meetingUrl;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public Integer getFeedbackRating() {
        return feedbackRating;
    }

    public void setFeedbackRating(Integer feedbackRating) {
        this.feedbackRating = feedbackRating;
    }

    public String getFeedbackStrengths() {
        return feedbackStrengths;
    }

    public void setFeedbackStrengths(String feedbackStrengths) {
        this.feedbackStrengths = feedbackStrengths;
    }

    public String getFeedbackImprovements() {
        return feedbackImprovements;
    }

    public void setFeedbackImprovements(String feedbackImprovements) {
        this.feedbackImprovements = feedbackImprovements;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }
}
