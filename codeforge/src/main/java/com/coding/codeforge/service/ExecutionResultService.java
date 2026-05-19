package com.coding.codeforge.service;

public class ExecutionResultService {
    private String status;   // OK, TLE, RE, CE
    private String output;
    private String error;

    public ExecutionResultService(String status, String output, String error) {
        this.status = status;
        this.output = output;
        this.error = error;
    }

    public String getStatus() { return status; }
    public String getOutput() { return output; }
    public String getError() { return error; }
}