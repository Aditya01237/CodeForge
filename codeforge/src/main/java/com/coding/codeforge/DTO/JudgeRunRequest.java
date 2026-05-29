package com.coding.codeforge.DTO;

public class JudgeRunRequest {
    private String language;
    private String code;
    private String input;

    public JudgeRunRequest() {}

    public JudgeRunRequest(String language, String code, String input) {
        this.language = language;
        this.code = code;
        this.input = input;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }
}