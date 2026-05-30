package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.ProblemRequest;
import com.coding.codeforge.DTO.TestCaseRequest;
import com.coding.codeforge.entity.Problem;
import com.coding.codeforge.entity.TestCaseEntity;
import com.coding.codeforge.service.ProblemService;
import com.coding.codeforge.service.TestCaseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ProblemController {

    private final ProblemService problemService;
    private final TestCaseService testCaseService;

    public ProblemController(ProblemService problemService,
                             TestCaseService testCaseService) {
        this.problemService = problemService;
        this.testCaseService = testCaseService;
    }

    @PostMapping("/faculty/problems")
    public Problem createProblem(@RequestBody ProblemRequest request) {
        return problemService.createProblem(request);
    }

    @GetMapping("/problems")
    public List<Problem> getAllProblems() {
        return problemService.getAllProblems();
    }

    @GetMapping("/problems/{id}")
    public Problem getProblemById(@PathVariable Long id) {
        return problemService.getProblemById(id);
    }

    @PostMapping("/faculty/problems/{problemId}/testcases")
    public TestCaseEntity addTestCase(
            @PathVariable Long problemId,
            @RequestBody TestCaseRequest request
    ) {
        return testCaseService.addTestCase(problemId, request);
    }

    @GetMapping("/problems/{problemId}/testcases/sample")
    public List<TestCaseEntity> getSampleTestCases(@PathVariable Long problemId) {
        return testCaseService.getSampleTestCases(problemId);
    }

    @GetMapping("/faculty/problems/{problemId}/testcases")
    public List<TestCaseEntity> getAllTestCases(@PathVariable Long problemId) {
        return testCaseService.getAllTestCasesForProblem(problemId);
    }
}