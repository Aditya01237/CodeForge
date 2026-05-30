package com.coding.codeforge.repository;

import com.coding.codeforge.entity.CodingTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodingTestRepository extends JpaRepository<CodingTest, Long> {
    Optional<CodingTest> findByTestCode(String testCode);
}