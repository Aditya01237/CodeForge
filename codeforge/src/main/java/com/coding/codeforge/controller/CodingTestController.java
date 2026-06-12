package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.*;
import com.coding.codeforge.entity.CodingTest;
import com.coding.codeforge.entity.TestParticipant;
import com.coding.codeforge.entity.TestProblem;
import com.coding.codeforge.service.CodingTestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CodingTestController {

    private final CodingTestService codingTestService;

    public CodingTestController(CodingTestService codingTestService) {
        this.codingTestService = codingTestService;
    }

    @PostMapping("/faculty/tests")
    public CodingTest createTest(@RequestBody CodingTestRequest request) {
        return codingTestService.createTest(request);
    }

    @GetMapping("/faculty/tests")
    public List<CodingTest> getAllTests() {
        return codingTestService.getAllTests();
    }

    @GetMapping("/faculty/tests/{testId}")
    public CodingTest getTestById(@PathVariable Long testId) {
        return codingTestService.getTestById(testId);
    }

    @PostMapping("/faculty/tests/{testId}/problems")
    public TestProblem addProblemToTest(
            @PathVariable Long testId,
            @RequestBody AddProblemToTestRequest request
    ) {
        return codingTestService.addProblemToTest(testId, request);
    }

    @PostMapping("/faculty/tests/{testId}/problems/create-and-attach")
    public TestProblem createProblemAndAttach(
            @PathVariable Long testId,
            @RequestBody CreateProblemForTestRequest request
    ) {
        return codingTestService.createProblemAndAttach(testId, request);
    }

    @DeleteMapping("/faculty/tests/{testId}/problems/{problemId}")
    public Map<String, Object> removeProblemFromTest(
            @PathVariable Long testId,
            @PathVariable Long problemId
    ) {
        codingTestService.removeProblemFromTest(testId, problemId);

        return Map.of(
                "success", true,
                "message", "Problem removed from test"
        );
    }

    @GetMapping("/tests/{testId}/problems")
    public List<TestProblem> getProblemsForTest(@PathVariable Long testId) {
        return codingTestService.getProblemsForTest(testId);
    }

    @GetMapping("/tests/join/{testCode}")
    public CodingTest joinTest(@PathVariable String testCode) {
        return codingTestService.joinTestByCode(testCode);
    }

    @PostMapping("/tests/verify-access")
    public TestAccessResponse verifyAccess(@RequestBody TestAccessRequest request) {
        return codingTestService.verifyAccess(request);
    }

    @PostMapping("/tests/{testId}/participants")
    public ParticipantResponse registerParticipant(
            @PathVariable Long testId,
            @RequestBody ParticipantRequest request
    ) {
        return codingTestService.registerParticipant(testId, request);
    }

    @GetMapping("/faculty/tests/{testId}/participants")
    public List<TestParticipant> getParticipantsForTest(@PathVariable Long testId) {
        return codingTestService.getParticipantsForTest(testId);
    }

    @PostMapping("/tests/{testId}/participants/{participantId}/start")
    public ParticipantResponse startParticipantTest(
            @PathVariable Long testId,
            @PathVariable Long participantId
    ) {
        return codingTestService.startParticipantTest(testId, participantId);
    }

    @PostMapping("/tests/{testId}/participants/{participantId}/disqualify")
    public ParticipantResponse disqualifyParticipant(
            @PathVariable Long testId,
            @PathVariable Long participantId,
            @RequestBody(required = false) ParticipantStatusRequest request
    ) {
        String reason = request == null ? "Fullscreen exited" : request.getReason();
        return codingTestService.disqualifyParticipant(testId, participantId, reason);
    }
}