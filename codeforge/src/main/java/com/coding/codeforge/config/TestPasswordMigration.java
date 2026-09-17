package com.coding.codeforge.config;

import com.coding.codeforge.entity.CodingTest;
import com.coding.codeforge.repository.CodingTestRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TestPasswordMigration implements ApplicationRunner {

    private final CodingTestRepository codingTestRepository;
    private final PasswordEncoder passwordEncoder;

    public TestPasswordMigration(
            CodingTestRepository codingTestRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.codingTestRepository = codingTestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        for (CodingTest codingTest : codingTestRepository.findAll()) {
            String password = codingTest.getTestPassword();
            if (password == null || password.isBlank() || isBcryptHash(password)) {
                continue;
            }

            codingTest.setTestPassword(passwordEncoder.encode(password));
            codingTestRepository.save(codingTest);
        }
    }

    private boolean isBcryptHash(String password) {
        return password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$");
    }
}
