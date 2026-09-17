package com.coding.codeforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 12)
    private String roomCode;

    private String title;
    private String interviewerName;
    private String candidateName;
    private LocalDateTime candidateJoinedAt;
    private String meetingUrl;
    private Integer durationMinutes = 45;
    private String status = "WAITING";
    private String language = "cpp";

    @Column(columnDefinition = "LONGTEXT")
    private String code;

    @JsonIgnore
    @Column(length = 100)
    private String interviewerTokenHash;

    @JsonIgnore
    @Column(length = 100)
    private String candidateTokenHash;

    @Column(columnDefinition = "TEXT")
    private String feedbackStrengths;

    @Column(columnDefinition = "TEXT")
    private String feedbackImprovements;

    private Integer feedbackRating;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonIgnoreProperties({"contentJson"})
    private Problem problem;

    public InterviewSession() {}

    @PrePersist
    public void beforeCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void beforeUpdate() {
        updatedAt = LocalDateTime.now();
    }

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

    @JsonIgnore
    public String getInterviewerTokenHash() {
        return interviewerTokenHash;
    }

    public void setInterviewerTokenHash(String interviewerTokenHash) {
        this.interviewerTokenHash = interviewerTokenHash;
    }

    @JsonIgnore
    public String getCandidateTokenHash() {
        return candidateTokenHash;
    }

    public void setCandidateTokenHash(String candidateTokenHash) {
        this.candidateTokenHash = candidateTokenHash;
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

    public Integer getFeedbackRating() {
        return feedbackRating;
    }

    public void setFeedbackRating(Integer feedbackRating) {
        this.feedbackRating = feedbackRating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
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

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }
}
