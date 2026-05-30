package com.coding.codeforge.DTO;

import java.time.LocalDateTime;

public class TestAccessResponse {
    private boolean valid;
    private Long testId;
    private String title;
    private String testCode;
    private Boolean allowExternalParticipants;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;

    public TestAccessResponse() {}

    public TestAccessResponse(boolean valid, Long testId, String title, String testCode,
                              Boolean allowExternalParticipants,
                              LocalDateTime startTime, LocalDateTime endTime,
                              Integer durationMinutes) {
        this.valid = valid;
        this.testId = testId;
        this.title = title;
        this.testCode = testCode;
        this.allowExternalParticipants = allowExternalParticipants;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
    }

    public boolean isValid() {
        return valid;
    }

    public Long getTestId() {
        return testId;
    }

    public String getTitle() {
        return title;
    }

    public String getTestCode() {
        return testCode;
    }

    public Boolean getAllowExternalParticipants() {
        return allowExternalParticipants;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setTestCode(String testCode) {
        this.testCode = testCode;
    }

    public void setAllowExternalParticipants(Boolean allowExternalParticipants) {
        this.allowExternalParticipants = allowExternalParticipants;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}