package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.CodeRequest;
import com.coding.codeforge.service.JudgeService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import com.coding.codeforge.data.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CodeController {

    private final JudgeService judgeService;

    public CodeController(JudgeService judgeService) {
        this.judgeService = judgeService;
    }

    @PostMapping("/run")
    public Map<String, Object> runCode(@RequestBody CodeRequest request) {

        return Map.of(
                "status", "Run Success",
                "results", judgeService.runTestCases(
                        request.getLanguage(),
                        request.getCode(),
                        ProblemData.getSample(request.getProblemId())
                )
        );
    }

    @PostMapping("/submit")
    public Map<String, Object> submitCode(@RequestBody CodeRequest request) {

        return judgeService.submitTestCases(
                request.getLanguage(),
                request.getCode(),
                ProblemData.getHidden(request.getProblemId())
        );
    }
}