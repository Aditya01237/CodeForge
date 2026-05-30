package com.coding.codeforge.DTO;

public class ParticipantRequest {
    private String participantType;
    private String rollNumber;
    private String name;
    private String email;
    private String identifier;

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
}