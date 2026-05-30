package com.coding.codeforge.service;

import com.coding.codeforge.DTO.*;
import com.coding.codeforge.entity.*;
import com.coding.codeforge.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CodingTestService {

    private final CodingTestRepository codingTestRepository;
    private final TestProblemRepository testProblemRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final TestParticipantRepository testParticipantRepository;

    public CodingTestService(CodingTestRepository codingTestRepository,
                             TestProblemRepository testProblemRepository,
                             ProblemRepository problemRepository,
                             UserRepository userRepository,
                             TestParticipantRepository testParticipantRepository) {
        this.codingTestRepository = codingTestRepository;
        this.testProblemRepository = testProblemRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.testParticipantRepository = testParticipantRepository;
    }

    public CodingTest createTest(CodingTestRequest request) {
        if (codingTestRepository.findByTestCode(request.getTestCode()).isPresent()) {
            throw new RuntimeException("Test code already exists: " + request.getTestCode());
        }

        CodingTest codingTest = new CodingTest();

        codingTest.setTitle(request.getTitle());
        codingTest.setTestCode(request.getTestCode());
        codingTest.setTestPassword(
                request.getTestPassword() == null || request.getTestPassword().isBlank()
                        ? "123456"
                        : request.getTestPassword()
        );

        codingTest.setAllowExternalParticipants(
                request.getAllowExternalParticipants() == null
                        ? true
                        : request.getAllowExternalParticipants()
        );

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

        validateTimeWindow(codingTest);

        return codingTest;
    }

    public TestAccessResponse verifyAccess(TestAccessRequest request) {
        CodingTest codingTest = codingTestRepository.findByTestCode(request.getTestCode())
                .orElseThrow(() -> new RuntimeException("Invalid test code"));

        validateTimeWindow(codingTest);

        String actualPassword = codingTest.getTestPassword();
        String givenPassword = request.getTestPassword();

        if (actualPassword == null || givenPassword == null || !actualPassword.equals(givenPassword)) {
            throw new RuntimeException("Invalid test password");
        }

        return new TestAccessResponse(
                true,
                codingTest.getId(),
                codingTest.getTitle(),
                codingTest.getTestCode(),
                codingTest.getAllowExternalParticipants(),
                codingTest.getStartTime(),
                codingTest.getEndTime(),
                codingTest.getDurationMinutes()
        );
    }

    public ParticipantResponse registerParticipant(Long testId, ParticipantRequest request) {
        CodingTest codingTest = codingTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Coding test not found"));

        validateTimeWindow(codingTest);

        ParticipantType type;
        try {
            type = ParticipantType.valueOf(request.getParticipantType());
        } catch (Exception e) {
            throw new RuntimeException("Invalid participant type");
        }

        if (type == ParticipantType.EXTERNAL &&
                Boolean.FALSE.equals(codingTest.getAllowExternalParticipants())) {
            throw new RuntimeException("External participants are not allowed for this test");
        }

        if (type == ParticipantType.STUDENT) {
            if (request.getRollNumber() == null || request.getRollNumber().isBlank()) {
                throw new RuntimeException("Roll number is required");
            }

            String rollNumber = request.getRollNumber().trim().toUpperCase();

            TestParticipant existing = testParticipantRepository
                    .findByCodingTestIdAndRollNumber(testId, rollNumber)
                    .orElse(null);

            if (existing != null) {
                return toParticipantResponse(existing);
            }

            TestParticipant participant = new TestParticipant();
            participant.setCodingTest(codingTest);
            participant.setParticipantType(ParticipantType.STUDENT);
            participant.setRollNumber(rollNumber);
            participant.setName(clean(request.getName()));
            participant.setEmail(clean(request.getEmail()));
            participant.setIdentifier(rollNumber);
            participant.setStatus("STARTED");

            return toParticipantResponse(testParticipantRepository.save(participant));
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Name is required");
        }

        String identifier = clean(request.getIdentifier());

        if (identifier == null || identifier.isBlank()) {
            identifier = clean(request.getEmail());
        }

        if (identifier == null || identifier.isBlank()) {
            identifier = request.getName().trim().toLowerCase().replaceAll("\\s+", "-");
        }

        TestParticipant existing = testParticipantRepository
                .findByCodingTestIdAndIdentifier(testId, identifier)
                .orElse(null);

        if (existing != null) {
            return toParticipantResponse(existing);
        }

        TestParticipant participant = new TestParticipant();
        participant.setCodingTest(codingTest);
        participant.setParticipantType(ParticipantType.EXTERNAL);
        participant.setRollNumber(null);
        participant.setName(clean(request.getName()));
        participant.setEmail(clean(request.getEmail()));
        participant.setIdentifier(identifier);
        participant.setStatus("STARTED");

        return toParticipantResponse(testParticipantRepository.save(participant));
    }

    public List<TestParticipant> getParticipantsForTest(Long testId) {
        return testParticipantRepository.findByCodingTestId(testId);
    }

    private void validateTimeWindow(CodingTest codingTest) {
        LocalDateTime now = LocalDateTime.now();

        if (codingTest.getStartTime() != null && now.isBefore(codingTest.getStartTime())) {
            throw new RuntimeException("Test has not started yet");
        }

        if (codingTest.getEndTime() != null && now.isAfter(codingTest.getEndTime())) {
            throw new RuntimeException("Test has ended");
        }
    }

    private ParticipantResponse toParticipantResponse(TestParticipant participant) {
        return new ParticipantResponse(
                participant.getId(),
                participant.getCodingTest().getId(),
                participant.getParticipantType().name(),
                participant.getRollNumber(),
                participant.getName(),
                participant.getEmail(),
                participant.getIdentifier(),
                participant.getStatus()
        );
    }

    private String clean(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }
}