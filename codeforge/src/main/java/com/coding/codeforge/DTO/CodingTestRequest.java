package com.coding.codeforge.DTO;

import java.time.LocalDateTime;

public class CodingTestRequest {
    private String title;
    private String testCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Long createdByUserId;

    public String getTitle() { return title; }
    public String getTestCode() { return testCode; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public Long getCreatedByUserId() { return createdByUserId; }

    public void setTitle(String title) { this.title = title; }
    public void setTestCode(String testCode) { this.testCode = testCode; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }
}