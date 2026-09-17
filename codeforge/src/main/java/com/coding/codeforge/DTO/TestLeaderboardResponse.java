package com.coding.codeforge.DTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TestLeaderboardResponse {

    private Long testId;
    private String title;
    private Integer totalProblems;
    private Integer totalParticipants;
    private LocalDateTime generatedAt;
    private List<LeaderboardEntryResponse> entries = new ArrayList<>();

    public TestLeaderboardResponse() {}

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

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public List<LeaderboardEntryResponse> getEntries() {
        return entries;
    }

    public void setEntries(List<LeaderboardEntryResponse> entries) {
        this.entries = entries;
    }
}
