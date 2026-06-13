package com.coding.codeforge.service;

import com.coding.codeforge.DTO.CodeRequest;
import com.coding.codeforge.DTO.ProblemStatusResponse;
import com.coding.codeforge.DTO.SubmissionResponse;
import com.coding.codeforge.entity.CodingTest;
import com.coding.codeforge.entity.Problem;
import com.coding.codeforge.entity.Submission;
import com.coding.codeforge.entity.TestParticipant;
import com.coding.codeforge.repository.CodingTestRepository;
import com.coding.codeforge.repository.ProblemRepository;
import com.coding.codeforge.repository.SubmissionRepository;
import com.coding.codeforge.repository.TestParticipantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final CodingTestRepository codingTestRepository;
    private final ProblemRepository problemRepository;
    private final TestParticipantRepository testParticipantRepository;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            CodingTestRepository codingTestRepository,
            ProblemRepository problemRepository,
            TestParticipantRepository testParticipantRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.codingTestRepository = codingTestRepository;
        this.problemRepository = problemRepository;
        this.testParticipantRepository = testParticipantRepository;
    }

    public SubmissionResponse saveContestSubmission(
            CodeRequest request,
            Map<String, Object> judgeResult,
            int totalTestCases
    ) {
        if (request.getTestId() == null || request.getParticipantId() == null) {
            return null;
        }

        CodingTest codingTest = codingTestRepository.findById(request.getTestId())
                .orElseThrow(() -> new RuntimeException("Coding test not found"));

        validateTestNotEnded(codingTest);

        TestParticipant participant = testParticipantRepository.findById(request.getParticipantId())
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        if (!participant.getCodingTest().getId().equals(codingTest.getId())) {
            throw new RuntimeException("Participant does not belong to this test");
        }

        validateParticipantCanSubmit(participant);

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        String status = extractString(judgeResult, "status", "Unknown");

        Integer failedTestCase = extractInteger(judgeResult, "failedTestCase");
        int passedTestCases = calculatePassedTestCases(status, failedTestCase, totalTestCases);
        int score = calculateScore(status, passedTestCases, totalTestCases);

        Submission submission = new Submission();
        submission.setCodingTest(codingTest);
        submission.setParticipant(participant);
        submission.setProblem(problem);
        submission.setLanguage(clean(request.getLanguage()));
        submission.setCode(request.getCode());
        submission.setStatus(status);
        submission.setScore(score);
        submission.setPassedTestCases(passedTestCases);
        submission.setTotalTestCases(totalTestCases);
        submission.setFailedTestCase(failedTestCase);
        submission.setOutput(extractString(judgeResult, "output", null));
        submission.setError(extractString(judgeResult, "error", null));
        submission.setSubmittedAt(LocalDateTime.now());

        Submission saved = submissionRepository.save(submission);

        return toResponse(saved);
    }

    public Map<Long, ProblemStatusResponse> getProblemStatusForParticipant(Long testId, Long participantId) {
        TestParticipant participant = testParticipantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        if (!participant.getCodingTest().getId().equals(testId)) {
            throw new RuntimeException("Participant does not belong to this test");
        }

        List<Submission> submissions = submissionRepository
                .findByCodingTest_IdAndParticipant_IdOrderBySubmittedAtDesc(testId, participantId);

        Map<Long, ProblemStatusResponse> statusMap = new LinkedHashMap<>();

        for (Submission submission : submissions) {
            if (submission.getProblem() == null || submission.getProblem().getId() == null) {
                continue;
            }

            Long problemId = submission.getProblem().getId();

            ProblemStatusResponse status = statusMap.get(problemId);

            if (status == null) {
                status = new ProblemStatusResponse(problemId);
                status.setProblemStatus("ATTEMPTED");
                status.setLatestSubmissionId(submission.getId());
                status.setLastSubmissionStatus(submission.getStatus());
                status.setLastSubmittedAt(submission.getSubmittedAt());
                status.setBestScore(safeScore(submission.getScore()));
                status.setAttempts(0);

                statusMap.put(problemId, status);
            }

            status.setAttempts(status.getAttempts() + 1);
            status.setBestScore(Math.max(status.getBestScore(), safeScore(submission.getScore())));

            if (isAcceptedStatus(submission.getStatus())) {
                status.setProblemStatus("ACCEPTED");

                if (status.getAcceptedSubmissionId() == null) {
                    status.setAcceptedSubmissionId(submission.getId());
                }
            }
        }

        return statusMap;
    }

    public SubmissionResponse toResponse(Submission submission) {
        return new SubmissionResponse(
                submission.getId(),
                submission.getCodingTest() == null ? null : submission.getCodingTest().getId(),
                submission.getParticipant() == null ? null : submission.getParticipant().getId(),
                submission.getProblem() == null ? null : submission.getProblem().getId(),
                submission.getLanguage(),
                submission.getStatus(),
                submission.getScore(),
                submission.getPassedTestCases(),
                submission.getTotalTestCases(),
                submission.getFailedTestCase(),
                submission.getOutput(),
                submission.getError(),
                submission.getSubmittedAt()
        );
    }

    private void validateTestNotEnded(CodingTest codingTest) {
        LocalDateTime now = LocalDateTime.now();

        if (codingTest.getStartTime() != null && now.isBefore(codingTest.getStartTime())) {
            throw new RuntimeException("Test has not started yet");
        }

        if (codingTest.getEndTime() != null && now.isAfter(codingTest.getEndTime())) {
            throw new RuntimeException("Test time is over. Submissions are closed.");
        }
    }

    private void validateParticipantCanSubmit(TestParticipant participant) {
        String status = participant.getStatus();

        if ("DISQUALIFIED".equals(status)) {
            throw new RuntimeException("You are disqualified from this contest.");
        }

        if ("SUBMITTED".equals(status) || "COMPLETED".equals(status)) {
            throw new RuntimeException("You have already completed this contest.");
        }

        if (!"IN_PROGRESS".equals(status)) {
            throw new RuntimeException("Contest is not active for this participant.");
        }
    }

    private int calculatePassedTestCases(String status, Integer failedTestCase, int totalTestCases) {
        if (isAcceptedStatus(status)) {
            return totalTestCases;
        }

        if (failedTestCase == null) {
            return 0;
        }

        return Math.max(0, Math.min(totalTestCases, failedTestCase - 1));
    }

    private int calculateScore(String status, int passedTestCases, int totalTestCases) {
        if (totalTestCases <= 0) {
            return isAcceptedStatus(status) ? 100 : 0;
        }

        if (isAcceptedStatus(status)) {
            return 100;
        }

        return (int) Math.floor((passedTestCases * 100.0) / totalTestCases);
    }

    private boolean isAcceptedStatus(String status) {
        if (status == null) return false;

        String normalized = status.trim().toUpperCase();

        return normalized.equals("ACCEPTED")
                || normalized.equals("AC")
                || normalized.equals("OK");
    }

    private int safeScore(Integer score) {
        return score == null ? 0 : score;
    }

    private String extractString(Map<String, Object> map, String key, String fallback) {
        Object value = map.get(key);
        if (value == null) return fallback;
        return String.valueOf(value);
    }

    private Integer extractInteger(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;

        if (value instanceof Integer integerValue) {
            return integerValue;
        }

        if (value instanceof Number numberValue) {
            return numberValue.intValue();
        }

        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception e) {
            return null;
        }
    }

    private String clean(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }
}