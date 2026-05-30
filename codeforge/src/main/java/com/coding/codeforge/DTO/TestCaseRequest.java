package com.coding.codeforge.DTO;

public class TestCaseRequest {
    private String inputData;
    private String expectedOutput;
    private boolean hidden;

    public String getInputData() { return inputData; }
    public String getExpectedOutput() { return expectedOutput; }
    public boolean isHidden() { return hidden; }

    public void setInputData(String inputData) { this.inputData = inputData; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
    public void setHidden(boolean hidden) { this.hidden = hidden; }
}