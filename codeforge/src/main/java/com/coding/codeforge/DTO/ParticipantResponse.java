package com.coding.codeforge.DTO;

public class ParticipantResponse {
    private Long participantId;
    private Long testId;
    private String participantType;
    private String rollNumber;
    private String name;
    private String email;
    private String identifier;
    private String status;

    public ParticipantResponse() {}

    public ParticipantResponse(Long participantId, Long testId, String participantType,
                               String rollNumber, String name, String email,
                               String identifier, String status) {
        this.participantId = participantId;
        this.testId = testId;
        this.participantType = participantType;
        this.rollNumber = rollNumber;
        this.name = name;
        this.email = email;
        this.identifier = identifier;
        this.status = status;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public Long getTestId() {
        return testId;
    }

    public String getParticipantType() {
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

    public String getStatus() {
        return status;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public void setParticipantType(String participantType) {
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

    public void setStatus(String status) {
        this.status = status;
    }
}