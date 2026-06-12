package com.coding.codeforge.repository;

import com.coding.codeforge.entity.TestProblem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestProblemRepository extends JpaRepository<TestProblem, Long> {

    List<TestProblem> findByCodingTest_Id(Long testId);

    List<TestProblem> findByCodingTest_IdOrderByProblemOrderAsc(Long testId);

    Optional<TestProblem> findByCodingTest_IdAndProblem_Id(Long testId, Long problemId);

    boolean existsByCodingTest_IdAndProblem_Id(Long testId, Long problemId);
}