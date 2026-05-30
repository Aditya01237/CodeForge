package com.coding.codeforge.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coding_tests")
public class CodingTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(unique = true)
    private String testCode;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer durationMinutes;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    public CodingTest() {}

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getTestCode() {
        return testCode;
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

    public User getCreatedBy() {
        return createdBy;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setTestCode(String testCode) {
        this.testCode = testCode;
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

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
}