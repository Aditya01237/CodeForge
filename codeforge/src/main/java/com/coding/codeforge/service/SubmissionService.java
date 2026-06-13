package com.coding.codeforge.service;

import com.coding.codeforge.DTO.*;
import com.coding.codeforge.entity.*;
import com.coding.codeforge.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final CodingTestRepository codingTestRepository;
    private final ProblemRepository problemRepository;
    private final TestParticipantRepository testParticipantRepository;
    private final TestProblemRepository testProblemRepository;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            CodingTestRepository codingTestRepository,
            ProblemRepository problemRepository,
            TestParticipantRepository testParticipantRepository,
            TestProblemRepository testProblemRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.codingTestRepository = codingTestRepository;
        this.problemRepository = problemRepository;
        this.testParticipantRepository = testParticipantRepository;
        this.testProblemRepository = testProblemRepository;
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

    public FacultyTestResultDashboardResponse getFacultyTestResultDashboard(Long testId) {
        CodingTest codingTest = codingTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Coding test not found"));

        List<TestProblem> attachedProblems =
                testProblemRepository.findByCodingTest_IdOrderByProblemOrderAsc(testId);

        List<TestParticipant> participants =
                testParticipantRepository.findByCodingTestId(testId);

        List<Submission> submissions =
                submissionRepository.findByCodingTest_IdOrderBySubmittedAtDesc(testId);

        Map<Long, List<Submission>> submissionsByParticipant = new HashMap<>();

        for (Submission submission : submissions) {
            if (submission.getParticipant() == null || submission.getParticipant().getId() == null) {
                continue;
            }

            Long participantId = submission.getParticipant().getId();

            submissionsByParticipant
                    .computeIfAbsent(participantId, key -> new ArrayList<>())
                    .add(submission);
        }

        FacultyTestResultDashboardResponse response = new FacultyTestResultDashboardResponse();
        response.setTestId(codingTest.getId());
        response.setTitle(codingTest.getTitle());
        response.setTestCode(codingTest.getTestCode());
        response.setStartTime(codingTest.getStartTime());
        response.setEndTime(codingTest.getEndTime());
        response.setTotalProblems(attachedProblems.size());
        response.setTotalParticipants(participants.size());
        response.setTotalSubmissions(submissions.size());

        int registered = 0;
        int inProgress = 0;
        int completed = 0;
        int disqualified = 0;

        List<FacultyParticipantResultResponse> participantResults = new ArrayList<>();

        for (TestParticipant participant : participants) {
            String status = normalizeStatus(participant.getStatus());

            if ("REGISTERED".equals(status)) registered++;
            else if ("IN_PROGRESS".equals(status)) inProgress++;
            else if ("COMPLETED".equals(status) || "SUBMITTED".equals(status)) completed++;
            else if ("DISQUALIFIED".equals(status)) disqualified++;

            List<Submission> participantSubmissions =
                    submissionsByParticipant.getOrDefault(participant.getId(), List.of());

            participantResults.add(
                    buildParticipantResult(participant, attachedProblems, participantSubmissions)
            );
        }

        participantResults.sort((a, b) -> {
            int scoreCompare = Integer.compare(
                    b.getTotalScore() == null ? 0 : b.getTotalScore(),
                    a.getTotalScore() == null ? 0 : a.getTotalScore()
            );

            if (scoreCompare != 0) return scoreCompare;

            String aName = a.getRollNumber() != null ? a.getRollNumber() : safe(a.getName());
            String bName = b.getRollNumber() != null ? b.getRollNumber() : safe(b.getName());

            return aName.compareToIgnoreCase(bName);
        });

        response.setRegisteredCount(registered);
        response.setInProgressCount(inProgress);
        response.setCompletedCount(completed);
        response.setDisqualifiedCount(disqualified);
        response.setParticipants(participantResults);

        return response;
    }

    public FacultySubmissionDetailResponse getFacultySubmissionDetail(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        FacultySubmissionDetailResponse response = new FacultySubmissionDetailResponse();

        response.setSubmissionId(submission.getId());

        if (submission.getCodingTest() != null) {
            response.setTestId(submission.getCodingTest().getId());
            response.setTestTitle(submission.getCodingTest().getTitle());
        }

        if (submission.getParticipant() != null) {
            response.setParticipantId(submission.getParticipant().getId());
            response.setParticipantName(submission.getParticipant().getName());
            response.setRollNumber(submission.getParticipant().getRollNumber());
            response.setIdentifier(submission.getParticipant().getIdentifier());
        }

        if (submission.getProblem() != null) {
            response.setProblemId(submission.getProblem().getId());
            response.setProblemTitle(submission.getProblem().getTitle());
        }

        response.setLanguage(submission.getLanguage());
        response.setStatus(submission.getStatus());
        response.setScore(submission.getScore());
        response.setPassedTestCases(submission.getPassedTestCases());
        response.setTotalTestCases(submission.getTotalTestCases());
        response.setFailedTestCase(submission.getFailedTestCase());
        response.setCode(submission.getCode());
        response.setOutput(submission.getOutput());
        response.setError(submission.getError());
        response.setSubmittedAt(submission.getSubmittedAt());

        return response;
    }

    private FacultyParticipantResultResponse buildParticipantResult(
            TestParticipant participant,
            List<TestProblem> attachedProblems,
            List<Submission> participantSubmissions
    ) {
        FacultyParticipantResultResponse response = new FacultyParticipantResultResponse();

        response.setParticipantId(participant.getId());
        response.setParticipantType(participant.getParticipantType() == null ? null : participant.getParticipantType().name());
        response.setRollNumber(participant.getRollNumber());
        response.setName(participant.getName());
        response.setEmail(participant.getEmail());
        response.setIdentifier(participant.getIdentifier());
        response.setStatus(participant.getStatus());
        response.setStartedAt(participant.getStartedAt());
        response.setSubmittedAt(participant.getSubmittedAt());

        response.setTotalProblems(attachedProblems.size());
        response.setMaxScore(attachedProblems.size() * 100);

        if (!participantSubmissions.isEmpty()) {
            Submission latest = participantSubmissions.get(0);
            response.setLatestSubmissionId(latest.getId());
            response.setLatestSubmissionStatus(latest.getStatus());
            response.setLatestSubmittedAt(latest.getSubmittedAt());

            if (latest.getProblem() != null) {
                response.setLatestSubmissionProblemTitle(latest.getProblem().getTitle());
            }
        }

        Map<Long, List<Submission>> byProblem = new HashMap<>();

        for (Submission submission : participantSubmissions) {
            if (submission.getProblem() == null || submission.getProblem().getId() == null) {
                continue;
            }

            byProblem
                    .computeIfAbsent(submission.getProblem().getId(), key -> new ArrayList<>())
                    .add(submission);
        }

        List<FacultyProblemResultResponse> problemResults = new ArrayList<>();

        int solved = 0;
        int attempted = 0;
        int totalScore = 0;

        for (TestProblem testProblem : attachedProblems) {
            if (testProblem.getProblem() == null) continue;

            Problem problem = testProblem.getProblem();
            List<Submission> problemSubmissions =
                    byProblem.getOrDefault(problem.getId(), List.of());

            FacultyProblemResultResponse problemResult =
                    buildProblemResult(problem, problemSubmissions);

            if ("ACCEPTED".equals(problemResult.getProblemStatus())) {
                solved++;
            }

            if ("ATTEMPTED".equals(problemResult.getProblemStatus())) {
                attempted++;
            }

            totalScore += safeScore(problemResult.getBestScore());
            problemResults.add(problemResult);
        }

        response.setSolvedCount(solved);
        response.setAttemptedCount(attempted);
        response.setTotalScore(totalScore);
        response.setProblems(problemResults);

        return response;
    }

    private FacultyProblemResultResponse buildProblemResult(
            Problem problem,
            List<Submission> submissions
    ) {
        FacultyProblemResultResponse response = new FacultyProblemResultResponse();

        response.setProblemId(problem.getId());
        response.setProblemTitle(problem.getTitle());
        response.setDifficulty(problem.getDifficulty());
        response.setAttempts(submissions.size());
        response.setBestScore(0);
        response.setProblemStatus("NOT_STARTED");

        if (submissions.isEmpty()) {
            return response;
        }

        response.setProblemStatus("ATTEMPTED");

        Submission latest = submissions.get(0);
        response.setLatestSubmissionId(latest.getId());
        response.setLatestSubmissionStatus(latest.getStatus());
        response.setLatestSubmittedAt(latest.getSubmittedAt());

        for (Submission submission : submissions) {
            response.setBestScore(Math.max(response.getBestScore(), safeScore(submission.getScore())));

            if (isAcceptedStatus(submission.getStatus())) {
                response.setProblemStatus("ACCEPTED");

                if (response.getAcceptedSubmissionId() == null) {
                    response.setAcceptedSubmissionId(submission.getId());
                }
            }
        }

        return response;
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

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return "REGISTERED";
        return status.trim().toUpperCase();
    }

    private String safe(String value) {
        return value == null ? "" : value;
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