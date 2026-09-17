package com.coding.codeforge.service;

import com.coding.codeforge.DTO.*;
import com.coding.codeforge.entity.InterviewSession;
import com.coding.codeforge.entity.Problem;
import com.coding.codeforge.repository.InterviewSessionRepository;
import com.coding.codeforge.repository.ProblemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;

@Service
public class InterviewService {

    private static final int MAX_CODE_LENGTH = 100_000;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final InterviewSessionRepository interviewSessionRepository;
    private final ProblemRepository problemRepository;
    private final PasswordEncoder passwordEncoder;

    public InterviewService(
            InterviewSessionRepository interviewSessionRepository,
            ProblemRepository problemRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.interviewSessionRepository = interviewSessionRepository;
        this.problemRepository = problemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public InterviewSessionResponse createInterview(CreateInterviewRequest request) {
        if (request.getInterviewerName() == null || request.getInterviewerName().isBlank()) {
            throw new RuntimeException("Interviewer name is required");
        }

        Problem problem = request.getProblemId() == null
                ? problemRepository.findAll().stream()
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Problem library is empty"))
                : problemRepository.findById(request.getProblemId())
                        .orElseThrow(() -> new RuntimeException("Problem not found"));

        InterviewSession session = new InterviewSession();
        session.setRoomCode(generateRoomCode());
        session.setTitle(
                clean(request.getTitle()) == null
                        ? "DSA Mock Interview"
                        : clean(request.getTitle())
        );
        session.setInterviewerName(clean(request.getInterviewerName()));
        session.setCandidateName(null);
        session.setCandidateJoinedAt(null);
        session.setMeetingUrl(clean(request.getMeetingUrl()));
        session.setDurationMinutes(validateDuration(request.getDurationMinutes()));
        session.setProblem(problem);
        session.setStatus("WAITING");
        session.setLanguage("cpp");
        session.setCode(defaultStarter("cpp"));
        String accessToken = generateAccessToken();
        session.setInterviewerTokenHash(passwordEncoder.encode(accessToken));

        return toResponse(
                interviewSessionRepository.save(session),
                AccessRole.INTERVIEWER,
                accessToken
        );
    }

    @Transactional
    public InterviewSessionResponse configureInterview(
            String roomCode,
            String accessToken,
            InterviewConfigurationRequest request
    ) {
        InterviewSession session = findByRoomCode(roomCode);
        requireInterviewer(session, accessToken);

        if ("COMPLETED".equals(session.getStatus())) {
            throw new RuntimeException("The question cannot be changed after the interview ends");
        }

        if (request.getProblemId() == null) {
            throw new RuntimeException("Problem is required");
        }

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        session.setProblem(problem);
        session.setDurationMinutes(validateDuration(request.getDurationMinutes()));
        return toResponse(
                interviewSessionRepository.save(session),
                AccessRole.INTERVIEWER,
                null
        );
    }

    public InterviewSessionResponse getInterview(String roomCode, String accessToken) {
        InterviewSession session = findByRoomCode(roomCode);
        AccessRole role = authorize(session, accessToken);
        return toResponse(session, role, null);
    }

    @Transactional
    public InterviewSessionResponse joinInterview(String roomCode, InterviewJoinRequest request) {
        InterviewSession session = findByRoomCode(roomCode);

        if ("COMPLETED".equals(session.getStatus())) {
            throw new RuntimeException("This interview has already ended");
        }

        if (session.getProblem() == null) {
            throw new RuntimeException("Select a problem before starting the interview");
        }

        String candidateName =
                request == null ? null : clean(request.getCandidateName());
        if (candidateName == null) {
            throw new RuntimeException("Candidate name is required");
        }

        if (session.getCandidateTokenHash() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A candidate has already joined this interview"
            );
        }

        String accessToken = generateAccessToken();
        session.setCandidateName(candidateName);
        session.setCandidateJoinedAt(LocalDateTime.now());
        session.setCandidateTokenHash(passwordEncoder.encode(accessToken));

        return toResponse(
                interviewSessionRepository.save(session),
                AccessRole.CANDIDATE,
                accessToken
        );
    }

    @Transactional
    public InterviewSessionResponse startInterview(
            String roomCode,
            String accessToken
    ) {
        InterviewSession session = findByRoomCode(roomCode);
        requireInterviewer(session, accessToken);

        if ("COMPLETED".equals(session.getStatus())) {
            throw new RuntimeException("This interview has already ended");
        }

        if (session.getStartedAt() == null) {
            session.setStartedAt(LocalDateTime.now());
        }

        session.setStatus("ACTIVE");
        return toResponse(
                interviewSessionRepository.save(session),
                AccessRole.INTERVIEWER,
                null
        );
    }

    @Transactional
    public InterviewSessionResponse syncCode(
            String roomCode,
            String accessToken,
            InterviewCodeRequest request
    ) {
        InterviewSession session = findByRoomCode(roomCode);
        AccessRole role = authorize(session, accessToken);

        if ("COMPLETED".equals(session.getStatus())) {
            throw new RuntimeException("This interview is read-only because it has ended");
        }

        String code = request.getCode() == null ? "" : request.getCode();
        if (code.length() > MAX_CODE_LENGTH) {
            throw new RuntimeException("Code is too large");
        }

        String language = normalizeLanguage(request.getLanguage());
        if (!language.equals(session.getLanguage())) {
            session.setLanguage(language);
            if (code.isBlank()) {
                code = defaultStarter(language);
            }
        }

        session.setLanguage(language);
        session.setCode(code);
        return toResponse(interviewSessionRepository.save(session), role, null);
    }

    @Transactional
    public InterviewSessionResponse completeInterview(
            String roomCode,
            String accessToken
    ) {
        InterviewSession session = findByRoomCode(roomCode);
        requireInterviewer(session, accessToken);
        session.setStatus("COMPLETED");
        if (session.getEndedAt() == null) {
            session.setEndedAt(LocalDateTime.now());
        }
        return toResponse(
                interviewSessionRepository.save(session),
                AccessRole.INTERVIEWER,
                null
        );
    }

    @Transactional
    public InterviewSessionResponse saveFeedback(
            String roomCode,
            String accessToken,
            InterviewFeedbackRequest request
    ) {
        InterviewSession session = findByRoomCode(roomCode);
        requireInterviewer(session, accessToken);

        if (request.getRating() != null &&
                (request.getRating() < 1 || request.getRating() > 5)) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        session.setFeedbackRating(request.getRating());
        session.setFeedbackStrengths(clean(request.getStrengths()));
        session.setFeedbackImprovements(clean(request.getImprovements()));
        return toResponse(
                interviewSessionRepository.save(session),
                AccessRole.INTERVIEWER,
                null
        );
    }

    private InterviewSession findByRoomCode(String roomCode) {
        if (roomCode == null || roomCode.isBlank()) {
            throw new RuntimeException("Room code is required");
        }

        return interviewSessionRepository.findByRoomCodeIgnoreCase(roomCode.trim())
                .orElseThrow(() -> new RuntimeException("Interview room not found"));
    }

    private String generateRoomCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 6)
                    .toUpperCase(Locale.ROOT);

            if (!interviewSessionRepository.existsByRoomCode(code)) {
                return code;
            }
        }

        throw new RuntimeException("Unable to create a unique room code");
    }

    private String generateAccessToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private AccessRole authorize(InterviewSession session, String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Join this interview through the Interview Studio first"
            );
        }

        if (session.getInterviewerTokenHash() != null &&
                passwordEncoder.matches(
                        accessToken,
                        session.getInterviewerTokenHash()
                )) {
            return AccessRole.INTERVIEWER;
        }

        if (session.getCandidateTokenHash() != null &&
                passwordEncoder.matches(
                        accessToken,
                        session.getCandidateTokenHash()
                )) {
            return AccessRole.CANDIDATE;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "This interview link does not include a valid room pass"
        );
    }

    private void requireInterviewer(
            InterviewSession session,
            String accessToken
    ) {
        if (authorize(session, accessToken) != AccessRole.INTERVIEWER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the interviewer can perform this action"
            );
        }
    }

    private Integer validateDuration(Integer duration) {
        if (duration == null) return 45;
        return Math.max(15, Math.min(duration, 180));
    }

    private String normalizeLanguage(String language) {
        if (language == null) return "cpp";

        String normalized = language.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals("c++")) normalized = "cpp";

        if (!normalized.equals("cpp") &&
                !normalized.equals("python") &&
                !normalized.equals("java")) {
            throw new RuntimeException("Supported languages: cpp, python, java");
        }

        return normalized;
    }

    private String defaultStarter(String language) {
        return switch (language) {
            case "python" -> "# Explain your approach, then write your solution\n";
            case "java" -> """
                    import java.util.*;

                    public class Main {
                        public static void main(String[] args) {
                            // Write your solution here
                        }
                    }
                    """;
            default -> """
                    #include <bits/stdc++.h>
                    using namespace std;

                    int main() {
                        // Write your solution here
                        return 0;
                    }
                    """;
        };
    }

    private InterviewSessionResponse toResponse(
            InterviewSession session,
            AccessRole viewerRole,
            String accessToken
    ) {
        InterviewSessionResponse response = new InterviewSessionResponse();
        response.setId(session.getId());
        response.setRoomCode(session.getRoomCode());
        response.setTitle(session.getTitle());
        response.setInterviewerName(session.getInterviewerName());
        response.setCandidateName(session.getCandidateName());
        response.setCandidateJoinedAt(session.getCandidateJoinedAt());
        response.setViewerRole(viewerRole.name());
        response.setAccessToken(accessToken);
        response.setMeetingUrl(session.getMeetingUrl());
        response.setDurationMinutes(session.getDurationMinutes());
        response.setStatus(session.getStatus());
        response.setLanguage(session.getLanguage());
        response.setCode(session.getCode());
        response.setFeedbackRating(session.getFeedbackRating());
        response.setFeedbackStrengths(session.getFeedbackStrengths());
        response.setFeedbackImprovements(session.getFeedbackImprovements());
        response.setCreatedAt(session.getCreatedAt());
        response.setStartedAt(session.getStartedAt());
        response.setEndedAt(session.getEndedAt());
        response.setUpdatedAt(session.getUpdatedAt());
        response.setProblem(session.getProblem());
        return response;
    }

    private enum AccessRole {
        INTERVIEWER,
        CANDIDATE
    }

    private String clean(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }
}
