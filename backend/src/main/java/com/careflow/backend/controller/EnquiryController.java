
package com.careflow.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.careflow.backend.entity.Enquiry;
import com.careflow.backend.repository.EnquiryRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/enquiries")
@CrossOrigin(origins = "http://localhost:5173")
public class EnquiryController {

    private final EnquiryRepository enquiryRepository;

    public EnquiryController(EnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    // Create a new enquiry
    @PostMapping
    public ResponseEntity<Enquiry> createEnquiry(
            @Valid @RequestBody Enquiry enquiry) {

        Enquiry savedEnquiry = enquiryRepository.save(enquiry);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedEnquiry);
    }

    // Get all enquiries
    @GetMapping
    public ResponseEntity<List<Enquiry>> getAllEnquiries() {

        List<Enquiry> enquiries = enquiryRepository.findAll();

        return ResponseEntity.ok(enquiries);
    }

    // Get an enquiry by ID
    @GetMapping("/{id}")
    public ResponseEntity<Enquiry> getEnquiryById(
            @PathVariable Long id) {

        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Enquiry not found with ID: " + id
                ));

        return ResponseEntity.ok(enquiry);
    }

    // Approve an AI-generated response
@PostMapping("/{id}/approve")
public ResponseEntity<Enquiry> approveResponse(
        @PathVariable Long id,
        @RequestBody Map<String, String> request) {

    Enquiry enquiry = enquiryRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Enquiry not found with ID: " + id
            ));

    String response = request.get("draftResponse");

    if (response == null || response.isBlank()) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Draft response cannot be empty"
        );
    }

    enquiry.setDraftResponse(response);
    enquiry.setStatus("APPROVED");
    enquiry.setApprovedAt(LocalDateTime.now());

    Enquiry savedEnquiry = enquiryRepository.save(enquiry);

    return ResponseEntity.ok(savedEnquiry);
}


// Update enquiry status
@PatchMapping("/{id}/status")
public ResponseEntity<Enquiry> updateEnquiryStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> request) {

    Enquiry enquiry = enquiryRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Enquiry not found with ID: " + id
            ));

    String status = request.get("status");

    if (status == null ||
            !List.of("NEW", "NEEDS_REVIEW", "APPROVED", "RESOLVED")
                    .contains(status)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid enquiry status"
        );
    }

    enquiry.setStatus(status);

    if ("RESOLVED".equals(status)) {
    enquiry.setResolvedAt(LocalDateTime.now());
}

    Enquiry updatedEnquiry = enquiryRepository.save(enquiry);

    return ResponseEntity.ok(updatedEnquiry);
}

// Update patient enquiry details
@PatchMapping("/{id}")
public ResponseEntity<Enquiry> updateEnquiry(
        @PathVariable Long id,
        @Valid @RequestBody Enquiry updatedData) {

    Enquiry enquiry = enquiryRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Enquiry not found with ID: " + id
            ));

    enquiry.setPatientName(updatedData.getPatientName());
    enquiry.setPhone(updatedData.getPhone());
    enquiry.setEmail(updatedData.getEmail());
    enquiry.setMessage(updatedData.getMessage());
    enquiry.setEnquiryType(updatedData.getEnquiryType());

    Enquiry savedEnquiry = enquiryRepository.save(enquiry);

    return ResponseEntity.ok(savedEnquiry);
}

// Delete an enquiry
@org.springframework.web.bind.annotation.DeleteMapping("/{id}")
public ResponseEntity<Void> deleteEnquiry(@PathVariable Long id) {

    Enquiry enquiry = enquiryRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Enquiry not found with ID: " + id
            ));

    enquiryRepository.delete(enquiry);

    return ResponseEntity.noContent().build();
}

}
