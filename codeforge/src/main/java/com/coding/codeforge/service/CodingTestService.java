package com.coding.codeforge.service;

import com.coding.codeforge.DTO.AddProblemToTestRequest;
import com.coding.codeforge.DTO.CodingTestRequest;
import com.coding.codeforge.entity.CodingTest;
import com.coding.codeforge.entity.Problem;
import com.coding.codeforge.entity.TestProblem;
import com.coding.codeforge.entity.User;
import com.coding.codeforge.repository.CodingTestRepository;
import com.coding.codeforge.repository.ProblemRepository;
import com.coding.codeforge.repository.TestProblemRepository;
import com.coding.codeforge.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CodingTestService {

    private final CodingTestRepository codingTestRepository;
    private final TestProblemRepository testProblemRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    public CodingTestService(CodingTestRepository codingTestRepository,
                             TestProblemRepository testProblemRepository,
                             ProblemRepository problemRepository,
                             UserRepository userRepository) {
        this.codingTestRepository = codingTestRepository;
        this.testProblemRepository = testProblemRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
    }

    public CodingTest createTest(CodingTestRequest request) {
        CodingTest codingTest = new CodingTest();

        codingTest.setTitle(request.getTitle());
        codingTest.setTestCode(request.getTestCode());
        codingTest.setStartTime(request.getStartTime());
        codingTest.setEndTime(request.getEndTime());
        codingTest.setDurationMinutes(request.getDurationMinutes());

        if (request.getCreatedByUserId() != null) {
            User faculty = userRepository.findById(request.getCreatedByUserId())
                    .orElseThrow(() -> new RuntimeException("Faculty user not found"));
            codingTest.setCreatedBy(faculty);
        }

        return codingTestRepository.save(codingTest);
    }

    public List<CodingTest> getAllTests() {
        return codingTestRepository.findAll();
    }

    public CodingTest getTestById(Long testId) {
        return codingTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Coding test not found"));
    }

    public TestProblem addProblemToTest(Long testId, AddProblemToTestRequest request) {
        CodingTest codingTest = codingTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Coding test not found"));

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        TestProblem testProblem = new TestProblem();
        testProblem.setCodingTest(codingTest);
        testProblem.setProblem(problem);
        testProblem.setProblemOrder(request.getProblemOrder());

        return testProblemRepository.save(testProblem);
    }

    public List<TestProblem> getProblemsForTest(Long testId) {
        return testProblemRepository.findByCodingTestId(testId);
    }

    public CodingTest joinTestByCode(String testCode) {
        CodingTest codingTest = codingTestRepository.findByTestCode(testCode)
                .orElseThrow(() -> new RuntimeException("Invalid test code"));

        LocalDateTime now = LocalDateTime.now();

        if (codingTest.getStartTime() != null && now.isBefore(codingTest.getStartTime())) {
            throw new RuntimeException("Test has not started yet");
        }

        if (codingTest.getEndTime() != null && now.isAfter(codingTest.getEndTime())) {
            throw new RuntimeException("Test has ended");
        }

        return codingTest;
    }
}