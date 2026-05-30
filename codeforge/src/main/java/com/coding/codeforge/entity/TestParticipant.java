package com.coding.codeforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "test_participants",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"test_id", "roll_number"}),
                @UniqueConstraint(columnNames = {"test_id", "identifier"})
        }
)
public class TestParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ParticipantType participantType;

    private String rollNumber;

    private String name;

    private String email;

    private String identifier;

    private LocalDateTime startedAt = LocalDateTime.now();

    private LocalDateTime submittedAt;

    private String status = "STARTED";

    @ManyToOne
    @JoinColumn(name = "test_id")
    @JsonIgnoreProperties({"createdBy", "testPassword"})
    private CodingTest codingTest;

    public TestParticipant() {}

    public Long getId() {
        return id;
    }

    public ParticipantType getParticipantType() {
        return participantType;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getIdentifier() {
        return identifier;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public String getStatus() {
        return status;
    }

    public CodingTest getCodingTest() {
        return codingTest;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setParticipantType(ParticipantType participantType) {
        this.participantType = participantType;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCodingTest(CodingTest codingTest) {
        this.codingTest = codingTest;
    }
}