package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.*;
import com.coding.codeforge.service.InterviewService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    public InterviewSessionResponse createInterview(
            @RequestBody CreateInterviewRequest request
    ) {
        return interviewService.createInterview(request);
    }

    @GetMapping("/rooms/{roomCode}")
    public InterviewSessionResponse getInterview(
            @PathVariable String roomCode,
            @RequestHeader(value = "X-Interview-Token", required = false) String accessToken
    ) {
        return interviewService.getInterview(roomCode, accessToken);
    }

    @PostMapping("/rooms/{roomCode}/join")
    public InterviewSessionResponse joinInterview(
            @PathVariable String roomCode,
            @RequestBody(required = false) InterviewJoinRequest request
    ) {
        return interviewService.joinInterview(roomCode, request);
    }

    @PostMapping("/rooms/{roomCode}/start")
    public InterviewSessionResponse startInterview(
            @PathVariable String roomCode,
            @RequestHeader(value = "X-Interview-Token", required = false) String accessToken
    ) {
        return interviewService.startInterview(roomCode, accessToken);
    }

    @PostMapping("/rooms/{roomCode}/configure")
    public InterviewSessionResponse configureInterview(
            @PathVariable String roomCode,
            @RequestHeader(value = "X-Interview-Token", required = false) String accessToken,
            @RequestBody InterviewConfigurationRequest request
    ) {
        return interviewService.configureInterview(roomCode, accessToken, request);
    }

    @PostMapping("/rooms/{roomCode}/code")
    public InterviewSessionResponse syncCode(
            @PathVariable String roomCode,
            @RequestHeader(value = "X-Interview-Token", required = false) String accessToken,
            @RequestBody InterviewCodeRequest request
    ) {
        return interviewService.syncCode(roomCode, accessToken, request);
    }

    @PostMapping("/rooms/{roomCode}/complete")
    public InterviewSessionResponse completeInterview(
            @PathVariable String roomCode,
            @RequestHeader(value = "X-Interview-Token", required = false) String accessToken
    ) {
        return interviewService.completeInterview(roomCode, accessToken);
    }

    @PostMapping("/rooms/{roomCode}/feedback")
    public InterviewSessionResponse saveFeedback(
            @PathVariable String roomCode,
            @RequestHeader(value = "X-Interview-Token", required = false) String accessToken,
            @RequestBody InterviewFeedbackRequest request
    ) {
        return interviewService.saveFeedback(roomCode, accessToken, request);
    }
}
