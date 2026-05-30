package com.coding.codeforge.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String language;

    @Column(columnDefinition = "TEXT")
    private String code;

    private String status;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String output;

    @Column(columnDefinition = "TEXT")
    private String error;

    private LocalDateTime submittedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private CodingTest codingTest;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    public Submission() {}

    public Long getId() {
        return id;
    }

    public String getLanguage() {
        return language;
    }

    public String getCode() {
        return code;
    }

    public String getStatus() {
        return status;
    }

    public Integer getScore() {
        return score;
    }

    public String getOutput() {
        return output;
    }

    public String getError() {
        return error;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public User getStudent() {
        return student;
    }

    public CodingTest getCodingTest() {
        return codingTest;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public void setError(String error) {
        this.error = error;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public void setCodingTest(CodingTest codingTest) {
        this.codingTest = codingTest;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }
}