package com.coding.codeforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String language;

    @Column(columnDefinition = "LONGTEXT")
    private String code;

    private String status;

    private Integer score = 0;

    private Integer passedTestCases = 0;

    private Integer totalTestCases = 0;

    private Integer failedTestCase;

    @Column(columnDefinition = "LONGTEXT")
    private String output;

    @Column(columnDefinition = "LONGTEXT")
    private String error;

    private LocalDateTime submittedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "participant_id")
    @JsonIgnoreProperties({"codingTest"})
    private TestParticipant participant;

    @ManyToOne
    @JoinColumn(name = "test_id")
    @JsonIgnoreProperties({"createdBy", "testPassword"})
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

    public Integer getPassedTestCases() {
        return passedTestCases;
    }

    public Integer getTotalTestCases() {
        return totalTestCases;
    }

    public Integer getFailedTestCase() {
        return failedTestCase;
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

    public TestParticipant getParticipant() {
        return participant;
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

    public void setPassedTestCases(Integer passedTestCases) {
        this.passedTestCases = passedTestCases;
    }

    public void setTotalTestCases(Integer totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public void setFailedTestCase(Integer failedTestCase) {
        this.failedTestCase = failedTestCase;
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

    public void setParticipant(TestParticipant participant) {
        this.participant = participant;
    }

    public void setCodingTest(CodingTest codingTest) {
        this.codingTest = codingTest;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }
}