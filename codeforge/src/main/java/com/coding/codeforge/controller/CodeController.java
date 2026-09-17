package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.CodeRequest;
import com.coding.codeforge.DTO.SubmissionResponse;
import com.coding.codeforge.entity.TestCaseEntity;
import com.coding.codeforge.service.JudgeService;
import com.coding.codeforge.service.SubmissionService;
import com.coding.codeforge.service.TestCaseService;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class CodeController {

    private static final int MAX_CODE_LENGTH = 100_000;
    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("cpp", "python", "java");

    private final JudgeService judgeService;
    private final TestCaseService testCaseService;
    private final SubmissionService submissionService;

    public CodeController(
            JudgeService judgeService,
            TestCaseService testCaseService,
            SubmissionService submissionService
    ) {
        this.judgeService = judgeService;
        this.testCaseService = testCaseService;
        this.submissionService = submissionService;
    }

    @PostMapping("/run")
    public Map<String, Object> runCode(@RequestBody CodeRequest request) {
        validateBasicRequest(request);

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
        validateBasicRequest(request);

        List<TestCaseEntity> hiddenTestCases = testCaseService.getHiddenTestCases(request.getProblemId());

        Map<String, Object> judgeResult = judgeService.submitTestCases(
                request.getLanguage(),
                request.getCode(),
                hiddenTestCases
        );

        Map<String, Object> response = new LinkedHashMap<>(judgeResult);

        SubmissionResponse savedSubmission = submissionService.saveContestSubmission(
                request,
                judgeResult,
                hiddenTestCases.size()
        );

        if (savedSubmission != null) {
            response.put("submission", savedSubmission);
        }

        return response;
    }

    private void validateBasicRequest(CodeRequest request) {
        if (request.getProblemId() == null) {
            throw new RuntimeException("Problem id is required");
        }

        if (request.getLanguage() == null || request.getLanguage().isBlank()) {
            throw new RuntimeException("Language is required");
        }

        if (!SUPPORTED_LANGUAGES.contains(request.getLanguage())) {
            throw new RuntimeException("Unsupported language");
        }

        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new RuntimeException("Code is required");
        }

        if (request.getCode().length() > MAX_CODE_LENGTH) {
            throw new RuntimeException("Code cannot exceed 100000 characters");
        }
    }
}
