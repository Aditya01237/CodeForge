package com.coding.codeforge.DTO;

public class CodeRequest {

    private String code;
    private String language;
    private int problemId;

    // GETTERS & SETTERS

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public int getProblemId() { return problemId; }
    public void setProblemId(int problemId) { this.problemId = problemId; }
}