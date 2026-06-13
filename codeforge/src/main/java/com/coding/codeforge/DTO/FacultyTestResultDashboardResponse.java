package com.coding.codeforge.DTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class FacultyTestResultDashboardResponse {

    private Long testId;
    private String title;
    private String testCode;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer totalProblems;
    private Integer totalParticipants;
    private Integer registeredCount;
    private Integer inProgressCount;
    private Integer completedCount;
    private Integer disqualifiedCount;
    private Integer totalSubmissions;

    private List<FacultyParticipantResultResponse> participants = new ArrayList<>();

    public FacultyTestResultDashboardResponse() {}

    public Long getTestId() {
        return testId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTestCode() {
        return testCode;
    }

    public void setTestCode(String testCode) {
        this.testCode = testCode;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getTotalProblems() {
        return totalProblems;
    }

    public void setTotalProblems(Integer totalProblems) {
        this.totalProblems = totalProblems;
    }

    public Integer getTotalParticipants() {
        return totalParticipants;
    }

    public void setTotalParticipants(Integer totalParticipants) {
        this.totalParticipants = totalParticipants;
    }

    public Integer getRegisteredCount() {
        return registeredCount;
    }

    public void setRegisteredCount(Integer registeredCount) {
        this.registeredCount = registeredCount;
    }

    public Integer getInProgressCount() {
        return inProgressCount;
    }

    public void setInProgressCount(Integer inProgressCount) {
        this.inProgressCount = inProgressCount;
    }

    public Integer getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(Integer completedCount) {
        this.completedCount = completedCount;
    }

    public Integer getDisqualifiedCount() {
        return disqualifiedCount;
    }

    public void setDisqualifiedCount(Integer disqualifiedCount) {
        this.disqualifiedCount = disqualifiedCount;
    }

    public Integer getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(Integer totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public List<FacultyParticipantResultResponse> getParticipants() {
        return participants;
    }

    public void setParticipants(List<FacultyParticipantResultResponse> participants) {
        this.participants = participants;
    }
}