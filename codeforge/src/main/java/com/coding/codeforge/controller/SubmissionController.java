package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.ProblemStatusResponse;
import com.coding.codeforge.service.SubmissionService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @GetMapping("/tests/{testId}/participants/{participantId}/problem-status")
    public Map<Long, ProblemStatusResponse> getProblemStatusForParticipant(
            @PathVariable Long testId,
            @PathVariable Long participantId
    ) {
        return submissionService.getProblemStatusForParticipant(testId, participantId);
    }
}