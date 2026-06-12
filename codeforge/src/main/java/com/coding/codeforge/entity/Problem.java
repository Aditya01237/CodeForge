package com.coding.codeforge.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String difficulty;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @Column(columnDefinition = "TEXT")
    private String constraintsText;

    /*
     * Stores rich problem content as JSON.
     *
     * Example:
     * {
     *   "blocks": [
     *     { "type": "paragraph", "text": "Given an array..." },
     *     { "type": "math", "text": "1 <= n <= 10^5" },
     *     { "type": "image", "url": "/uploads/problem-images/abc.png", "caption": "Tree" }
     *   ]
     * }
     */
    @Column(columnDefinition = "LONGTEXT")
    private String contentJson;

    /*
     * true  -> available in global problem bank
     * false -> created only for one test
     */
    private Boolean reusable = true;

    /*
     * If reusable=false, this tells for which test this problem was created.
     */
    private Long createdForTestId;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Problem() {}

    public Long getId() {
        return id;
    }

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

    public Long getCreatedForTestId() {
        return createdForTestId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
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

    public void setCreatedForTestId(Long createdForTestId) {
        this.createdForTestId = createdForTestId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}