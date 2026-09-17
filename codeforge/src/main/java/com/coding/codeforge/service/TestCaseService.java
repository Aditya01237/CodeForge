package com.coding.codeforge.service;

import com.coding.codeforge.DTO.TestCaseRequest;
import com.coding.codeforge.entity.Problem;
import com.coding.codeforge.entity.TestCaseEntity;
import com.coding.codeforge.repository.ProblemRepository;
import com.coding.codeforge.repository.TestCaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestCaseService {

    private static final int MAX_TEST_CASE_TEXT_LENGTH = 100_000;

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;

    public TestCaseService(TestCaseRepository testCaseRepository,
                           ProblemRepository problemRepository) {
        this.testCaseRepository = testCaseRepository;
        this.problemRepository = problemRepository;
    }

    public TestCaseEntity addTestCase(Long problemId, TestCaseRequest request) {
        if (tooLarge(request.getInputData()) || tooLarge(request.getExpectedOutput())) {
            throw new RuntimeException("Test case input or output is too large");
        }

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        TestCaseEntity testCase = new TestCaseEntity();
        testCase.setProblem(problem);
        testCase.setInputData(request.getInputData());
        testCase.setExpectedOutput(request.getExpectedOutput());
        testCase.setExplanation(request.getExplanation());
        testCase.setHidden(request.isHidden());

        return testCaseRepository.save(testCase);
    }

    public List<TestCaseEntity> getSampleTestCases(Long problemId) {
        return testCaseRepository.findByProblemIdAndHidden(problemId, false);
    }

    public List<TestCaseEntity> getHiddenTestCases(Long problemId) {
        return testCaseRepository.findByProblemIdAndHidden(problemId, true);
    }

    public List<TestCaseEntity> getAllTestCasesForProblem(Long problemId) {
        return testCaseRepository.findByProblemId(problemId);
    }

    private boolean tooLarge(String value) {
        return value != null && value.length() > MAX_TEST_CASE_TEXT_LENGTH;
    }
}
