package com.coding.codeforge.repository;

import com.coding.codeforge.entity.TestParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestParticipantRepository extends JpaRepository<TestParticipant, Long> {
    List<TestParticipant> findByCodingTestId(Long testId);

    Optional<TestParticipant> findByCodingTestIdAndRollNumber(Long testId, String rollNumber);

    Optional<TestParticipant> findByCodingTestIdAndIdentifier(Long testId, String identifier);
}