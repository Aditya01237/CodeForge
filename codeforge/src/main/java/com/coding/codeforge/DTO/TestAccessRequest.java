package com.coding.codeforge.DTO;

public class TestAccessRequest {
    private String testCode;
    private String testPassword;

    public String getTestCode() {
        return testCode;
    }

    public String getTestPassword() {
        return testPassword;
    }

    public void setTestCode(String testCode) {
        this.testCode = testCode;
    }

    public void setTestPassword(String testPassword) {
        this.testPassword = testPassword;
    }
}