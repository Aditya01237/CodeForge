package com.coding.codeforge.repository;

import com.coding.codeforge.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    Optional<InterviewSession> findByRoomCodeIgnoreCase(String roomCode);
    boolean existsByRoomCode(String roomCode);
}
