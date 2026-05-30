package com.coding.codeforge.repository;

import com.coding.codeforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByRollNumber(String rollNumber);
    Optional<User> findByEmail(String email);
}