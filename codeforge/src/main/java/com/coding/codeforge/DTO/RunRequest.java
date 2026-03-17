package com.coding.codeforge.DTO;

import lombok.Data;

@Data
public class RunRequest {
    private String code;
    private String language;
    private String input;
    private int problemId;
}