package com.coding.codeforge.DTO;

public class ProblemRequest {
    private String title;
    private String difficulty;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String constraintsText;

    public String getTitle() { return title; }
    public String getDifficulty() { return difficulty; }
    public String getDescription() { return description; }
    public String getInputFormat() { return inputFormat; }
    public String getOutputFormat() { return outputFormat; }
    public String getConstraintsText() { return constraintsText; }

    public void setTitle(String title) { this.title = title; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setDescription(String description) { this.description = description; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }
    public void setConstraintsText(String constraintsText) { this.constraintsText = constraintsText; }
}