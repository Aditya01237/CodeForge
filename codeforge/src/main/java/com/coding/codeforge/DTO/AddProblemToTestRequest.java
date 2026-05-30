package com.coding.codeforge.DTO;

public class AddProblemToTestRequest {
    private Long problemId;
    private Integer problemOrder;

    public Long getProblemId() { return problemId; }
    public Integer getProblemOrder() { return problemOrder; }

    public void setProblemId(Long problemId) { this.problemId = problemId; }
    public void setProblemOrder(Integer problemOrder) { this.problemOrder = problemOrder; }
}