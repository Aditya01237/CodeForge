package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.CodeRequest;
import com.coding.codeforge.service.JudgeService;
import com.coding.codeforge.service.TestCaseService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CodeController {

    private final JudgeService judgeService;
    private final TestCaseService testCaseService;

    public CodeController(JudgeService judgeService,
                          TestCaseService testCaseService) {
        this.judgeService = judgeService;
        this.testCaseService = testCaseService;
    }

    @PostMapping("/run")
    public Map<String, Object> runCode(@RequestBody CodeRequest request) {

        return Map.of(
                "status", "Run Success",
                "results", judgeService.runTestCases(
                        request.getLanguage(),
                        request.getCode(),
                        testCaseService.getSampleTestCases(request.getProblemId())
                )
        );
    }

    @PostMapping("/submit")
    public Map<String, Object> submitCode(@RequestBody CodeRequest request) {

        return judgeService.submitTestCases(
                request.getLanguage(),
                request.getCode(),
                testCaseService.getHiddenTestCases(request.getProblemId())
        );
    }
}