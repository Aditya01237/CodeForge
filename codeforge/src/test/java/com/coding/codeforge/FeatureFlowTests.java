package com.coding.codeforge;

import com.coding.codeforge.DTO.*;
import com.coding.codeforge.entity.*;
import com.coding.codeforge.repository.*;
import com.coding.codeforge.service.InterviewService;
import com.coding.codeforge.service.CodingTestService;
import com.coding.codeforge.service.SubmissionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class FeatureFlowTests {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private CodingTestRepository codingTestRepository;

    @Autowired
    private TestProblemRepository testProblemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private TestParticipantRepository testParticipantRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private CodingTestService codingTestService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void hashesAndNeverSerializesTestPasswords() throws Exception {
        CodingTestRequest request = new CodingTestRequest();
        request.setTitle("Security Test");
        request.setTestCode("SECURE01");
        request.setTestPassword("only-for-students");
        request.setStartTime(LocalDateTime.now().minusMinutes(1));
        request.setEndTime(LocalDateTime.now().plusHours(1));
        request.setDurationMinutes(30);

        CodingTest created = codingTestService.createTest(request);
        CodingTest stored = codingTestRepository.findById(created.getId()).orElseThrow();

        assertNotEquals("only-for-students", stored.getTestPassword());
        assertTrue(stored.getTestPassword().startsWith("$2"));
        assertFalse(objectMapper.writeValueAsString(created).contains("testPassword"));

        TestAccessRequest accessRequest = new TestAccessRequest();
        accessRequest.setTestCode("SECURE01");
        accessRequest.setTestPassword("only-for-students");
        assertTrue(codingTestService.verifyAccess(accessRequest).isValid());
    }

    @Test
    void shipsWithJudgeReadyPracticeLibrary() {
        assertTrue(problemRepository.count() >= 15);

        Problem problem = problemRepository.findByTitleIgnoreCase("Maximum Subarray Sum")
                .orElseThrow();

        assertEquals("Dynamic Programming", problem.getCategory());
        var sampleCases =
                testCaseRepository.findByProblemIdAndHidden(problem.getId(), false);
        assertFalse(sampleCases.isEmpty());
        assertNotNull(sampleCases.get(0).getExplanation());
        assertFalse(sampleCases.get(0).getExplanation().isBlank());
        assertTrue(testCaseRepository.findByProblemIdAndHidden(problem.getId(), true).size() >= 2);
    }

    @Test
    void completesInterviewRoomLifecycle() {
        Problem problem = new Problem();
        problem.setTitle("Two Sum");
        problem.setDifficulty("Easy");
        problem.setDescription("Find two values that sum to a target.");
        problem = problemRepository.save(problem);

        CreateInterviewRequest createRequest = new CreateInterviewRequest();
        createRequest.setInterviewerName("Faculty Mentor");

        InterviewSessionResponse created = interviewService.createInterview(createRequest);

        assertEquals("WAITING", created.getStatus());
        assertEquals(6, created.getRoomCode().length());
        assertNotNull(created.getProblem());
        assertNotNull(created.getAccessToken());
        assertEquals("INTERVIEWER", created.getViewerRole());
        assertThrows(
                ResponseStatusException.class,
                () -> interviewService.getInterview(created.getRoomCode(), null)
        );

        String interviewerToken = created.getAccessToken();

        InterviewConfigurationRequest configurationRequest =
                new InterviewConfigurationRequest();
        configurationRequest.setProblemId(problem.getId());
        configurationRequest.setDurationMinutes(60);
        InterviewSessionResponse configured = interviewService.configureInterview(
                created.getRoomCode(),
                interviewerToken,
                configurationRequest
        );

        assertEquals(problem.getId(), configured.getProblem().getId());
        assertEquals(60, configured.getDurationMinutes());

        InterviewSessionResponse started =
                interviewService.startInterview(
                        created.getRoomCode(),
                        interviewerToken
                );
        assertEquals("ACTIVE", started.getStatus());
        assertNotNull(started.getStartedAt());
        assertNull(started.getCandidateName());

        InterviewJoinRequest joinRequest = new InterviewJoinRequest();
        joinRequest.setCandidateName("Student One");
        InterviewSessionResponse joined =
                interviewService.joinInterview(created.getRoomCode(), joinRequest);

        assertEquals("Student One", joined.getCandidateName());
        assertEquals("CANDIDATE", joined.getViewerRole());
        assertNotNull(joined.getAccessToken());
        assertNotNull(joined.getCandidateJoinedAt());
        assertThrows(
                ResponseStatusException.class,
                () -> interviewService.startInterview(
                        created.getRoomCode(),
                        joined.getAccessToken()
                )
        );
        assertEquals(
                "Student One",
                interviewService.getInterview(
                        created.getRoomCode(),
                        interviewerToken
                ).getCandidateName()
        );

        Problem followUpProblem = new Problem();
        followUpProblem.setTitle("Reverse Array");
        followUpProblem.setDifficulty("Easy");
        followUpProblem.setDescription("Reverse the supplied values.");
        followUpProblem = problemRepository.save(followUpProblem);

        InterviewConfigurationRequest followUpConfiguration =
                new InterviewConfigurationRequest();
        followUpConfiguration.setProblemId(followUpProblem.getId());
        followUpConfiguration.setDurationMinutes(60);

        InterviewSessionResponse switched =
                interviewService.configureInterview(
                        created.getRoomCode(),
                        interviewerToken,
                        followUpConfiguration
                );
        assertEquals("ACTIVE", switched.getStatus());
        assertEquals(followUpProblem.getId(), switched.getProblem().getId());

        InterviewCodeRequest codeRequest = new InterviewCodeRequest();
        codeRequest.setLanguage("python");
        codeRequest.setCode("print('ready')\n");
        InterviewSessionResponse synced =
                interviewService.syncCode(
                        created.getRoomCode(),
                        joined.getAccessToken(),
                        codeRequest
                );

        assertEquals("python", synced.getLanguage());
        assertEquals("print('ready')\n", synced.getCode());

        InterviewFeedbackRequest feedbackRequest = new InterviewFeedbackRequest();
        feedbackRequest.setRating(5);
        feedbackRequest.setStrengths("Clear explanation");
        feedbackRequest.setImprovements("Discuss space complexity");
        InterviewSessionResponse feedback =
                interviewService.saveFeedback(
                        created.getRoomCode(),
                        interviewerToken,
                        feedbackRequest
                );

        assertEquals(5, feedback.getFeedbackRating());

        InterviewSessionResponse completed =
                interviewService.completeInterview(
                        created.getRoomCode(),
                        interviewerToken
                );
        assertEquals("COMPLETED", completed.getStatus());
        assertNotNull(completed.getEndedAt());
    }

    @Test
    void ranksParticipantsByBestScoreAndSolvedCount() {
        CodingTest codingTest = new CodingTest();
        codingTest.setTitle("DSA Lab");
        codingTest.setTestCode("RANK01");
        codingTest.setTestPassword("secret");
        codingTest = codingTestRepository.save(codingTest);

        Problem problem = new Problem();
        problem.setTitle("Array Pair");
        problem.setDifficulty("Easy");
        problem = problemRepository.save(problem);

        TestProblem testProblem = new TestProblem();
        testProblem.setCodingTest(codingTest);
        testProblem.setProblem(problem);
        testProblem.setProblemOrder(1);
        testProblemRepository.save(testProblem);

        TestParticipant first = participant(codingTest, "1IIIT001", "Aarav");
        TestParticipant second = participant(codingTest, "1IIIT002", "Diya");
        first = testParticipantRepository.save(first);
        second = testParticipantRepository.save(second);

        submissionRepository.save(
                submission(codingTest, first, problem, "Accepted", 100, 1)
        );
        submissionRepository.save(
                submission(codingTest, second, problem, "Wrong Answer", 50, 0)
        );

        TestLeaderboardResponse leaderboard =
                submissionService.getTestLeaderboard(codingTest.getId());

        assertEquals(2, leaderboard.getEntries().size());
        assertEquals(first.getId(), leaderboard.getEntries().get(0).getParticipantId());
        assertEquals(1, leaderboard.getEntries().get(0).getRank());
        assertEquals(100, leaderboard.getEntries().get(0).getTotalScore());
        assertEquals(1, leaderboard.getEntries().get(0).getSolvedCount());
    }

    private TestParticipant participant(
            CodingTest codingTest,
            String rollNumber,
            String name
    ) {
        TestParticipant participant = new TestParticipant();
        participant.setCodingTest(codingTest);
        participant.setParticipantType(ParticipantType.STUDENT);
        participant.setRollNumber(rollNumber);
        participant.setIdentifier(rollNumber);
        participant.setName(name);
        participant.setStatus("IN_PROGRESS");
        participant.setStartedAt(LocalDateTime.now().minusMinutes(10));
        return participant;
    }

    private Submission submission(
            CodingTest codingTest,
            TestParticipant participant,
            Problem problem,
            String status,
            int score,
            int passed
    ) {
        Submission submission = new Submission();
        submission.setCodingTest(codingTest);
        submission.setParticipant(participant);
        submission.setProblem(problem);
        submission.setLanguage("cpp");
        submission.setCode("int main() { return 0; }");
        submission.setStatus(status);
        submission.setScore(score);
        submission.setPassedTestCases(passed);
        submission.setTotalTestCases(1);
        submission.setSubmittedAt(LocalDateTime.now());
        return submission;
    }
}
