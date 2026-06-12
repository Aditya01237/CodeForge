package com.coding.codeforge.DTO;

import java.util.ArrayList;
import java.util.List;

public class CreateProblemForTestRequest {

    private String title;
    private String difficulty;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String constraintsText;
    private String contentJson;

    /*
     * true  -> add to global problem bank also
     * false -> only for this test
     */
    private Boolean reusable = false;

    private Integer problemOrder;

    private List<TestCaseRequest> sampleTestCases = new ArrayList<>();
    private List<TestCaseRequest> hiddenTestCases = new ArrayList<>();

    public String getTitle() {
        return title;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getDescription() {
        return description;
    }

    public String getInputFormat() {
        return inputFormat;
    }

    public String getOutputFormat() {
        return outputFormat;
    }

    public String getConstraintsText() {
        return constraintsText;
    }

    public String getContentJson() {
        return contentJson;
    }

    public Boolean getReusable() {
        return reusable;
    }

    public Integer getProblemOrder() {
        return problemOrder;
    }

    public List<TestCaseRequest> getSampleTestCases() {
        return sampleTestCases;
    }

    public List<TestCaseRequest> getHiddenTestCases() {
        return hiddenTestCases;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setInputFormat(String inputFormat) {
        this.inputFormat = inputFormat;
    }

    public void setOutputFormat(String outputFormat) {
        this.outputFormat = outputFormat;
    }

    public void setConstraintsText(String constraintsText) {
        this.constraintsText = constraintsText;
    }

    public void setContentJson(String contentJson) {
        this.contentJson = contentJson;
    }

    public void setReusable(Boolean reusable) {
        this.reusable = reusable;
    }

    public void setProblemOrder(Integer problemOrder) {
        this.problemOrder = problemOrder;
    }

    public void setSampleTestCases(List<TestCaseRequest> sampleTestCases) {
        this.sampleTestCases = sampleTestCases;
    }

    public void setHiddenTestCases(List<TestCaseRequest> hiddenTestCases) {
        this.hiddenTestCases = hiddenTestCases;
    }
}