package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.AddProblemToTestRequest;
import com.coding.codeforge.DTO.CodingTestRequest;
import com.coding.codeforge.entity.CodingTest;
import com.coding.codeforge.entity.TestProblem;
import com.coding.codeforge.service.CodingTestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/tests/{testId}/problems")
    public List<TestProblem> getProblemsForTest(@PathVariable Long testId) {
        return codingTestService.getProblemsForTest(testId);
    }

    @GetMapping("/tests/join/{testCode}")
    public CodingTest joinTest(@PathVariable String testCode) {
        return codingTestService.joinTestByCode(testCode);
    }
}