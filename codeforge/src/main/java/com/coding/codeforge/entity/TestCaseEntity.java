package com.coding.codeforge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String inputData;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    private boolean hidden;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    public TestCaseEntity() {}

    public Long getId() {
        return id;
    }

    public String getInputData() {
        return inputData;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public boolean isHidden() {
        return hidden;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setInputData(String inputData) {
        this.inputData = inputData;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }
}