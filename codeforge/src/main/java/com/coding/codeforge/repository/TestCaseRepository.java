package com.coding.codeforge.repository;

import com.coding.codeforge.entity.TestCaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCaseEntity, Long> {
    List<TestCaseEntity> findByProblemIdAndHidden(Long problemId, boolean hidden);
}