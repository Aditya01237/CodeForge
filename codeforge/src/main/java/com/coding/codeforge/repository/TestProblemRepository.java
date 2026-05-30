package com.coding.codeforge.repository;

import com.coding.codeforge.entity.TestProblem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestProblemRepository extends JpaRepository<TestProblem, Long> {
    List<TestProblem> findByCodingTestId(Long testId);
}