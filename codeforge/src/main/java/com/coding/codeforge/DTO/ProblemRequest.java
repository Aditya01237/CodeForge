package com.coding.codeforge.DTO;

public class ProblemRequest {
    private String title;
    private String difficulty;
    private String category;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String constraintsText;
    private String contentJson;
    private Boolean reusable;
    private Long createdForTestId;

    public String getTitle() {
        return title;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getCategory() {
        return category;
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

    public Long getCreatedForTestId() {
        return createdForTestId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public void setCreatedForTestId(Long createdForTestId) {
        this.createdForTestId = createdForTestId;
    }
}
