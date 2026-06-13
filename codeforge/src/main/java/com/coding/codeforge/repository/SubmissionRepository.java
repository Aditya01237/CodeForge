package com.coding.codeforge.repository;

import com.coding.codeforge.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByCodingTest_Id(Long testId);

    List<Submission> findByCodingTest_IdOrderBySubmittedAtDesc(Long testId);

    List<Submission> findByParticipant_Id(Long participantId);

    List<Submission> findByProblem_Id(Long problemId);

    List<Submission> findByCodingTest_IdAndParticipant_Id(Long testId, Long participantId);

    List<Submission> findByCodingTest_IdAndParticipant_IdOrderBySubmittedAtDesc(Long testId, Long participantId);

    List<Submission> findByCodingTest_IdAndParticipant_IdAndProblem_IdOrderBySubmittedAtDesc(
            Long testId,
            Long participantId,
            Long problemId
    );

    Optional<Submission> findTopByCodingTest_IdAndParticipant_IdAndProblem_IdOrderBySubmittedAtDesc(
            Long testId,
            Long participantId,
            Long problemId
    );
}