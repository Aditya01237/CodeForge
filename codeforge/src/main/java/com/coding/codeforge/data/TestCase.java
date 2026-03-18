package com.coding.codeforge.data;

public class TestCase {
    private String input;
    private String output;

    public TestCase(String input, String output) {
        this.input = input;
        this.output = output;
    }

    public String getInput() { return input; }
    public String getOutput() { return output; }
}