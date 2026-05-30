package com.coding.codeforge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "test_problems")
public class TestProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer problemOrder;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private CodingTest codingTest;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    public TestProblem() {}

    public Long getId() {
        return id;
    }

    public Integer getProblemOrder() {
        return problemOrder;
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

    public void setProblemOrder(Integer problemOrder) {
        this.problemOrder = problemOrder;
    }

    public void setCodingTest(CodingTest codingTest) {
        this.codingTest = codingTest;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }
}