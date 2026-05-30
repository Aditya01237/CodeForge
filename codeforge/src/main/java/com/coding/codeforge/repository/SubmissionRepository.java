package com.coding.codeforge.repository;

import com.coding.codeforge.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudentId(Long studentId);
    List<Submission> findByCodingTestId(Long testId);
    List<Submission> findByProblemId(Long problemId);
}