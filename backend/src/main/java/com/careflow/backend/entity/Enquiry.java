package com.careflow.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "enquiries")
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Patient name is required")
    @Column(nullable = false)
    private String patientName;

    private String phone;

    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Enquiry message is required")
    @Column(nullable = false, length = 2000)
    private String message;

    private String enquiryType;

    private String status = "NEW";

    @Column(length = 5000)
    private String draftResponse;

   private LocalDateTime approvedAt;

private LocalDateTime analyzedAt;

private LocalDateTime resolvedAt;

private LocalDateTime createdAt;

    public Enquiry() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEnquiryType() {
        return enquiryType;
    }

    public void setEnquiryType(String enquiryType) {
        this.enquiryType = enquiryType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDraftResponse() {
    return draftResponse;
}

public void setDraftResponse(String draftResponse) {
    this.draftResponse = draftResponse;
}

public LocalDateTime getApprovedAt() {
    return approvedAt;
}

public void setApprovedAt(LocalDateTime approvedAt) {
    this.approvedAt = approvedAt;
}

public LocalDateTime getAnalyzedAt() {
    return analyzedAt;
}

public void setAnalyzedAt(LocalDateTime analyzedAt) {
    this.analyzedAt = analyzedAt;
}

public LocalDateTime getResolvedAt() {
    return resolvedAt;
}

public void setResolvedAt(LocalDateTime resolvedAt) {
    this.resolvedAt = resolvedAt;
}

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
