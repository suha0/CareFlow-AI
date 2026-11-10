package com.careflow.backend.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.careflow.backend.entity.Enquiry;
import com.careflow.backend.repository.EnquiryRepository;
import com.careflow.backend.service.GeminiService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    private final GeminiService geminiService;
    private final EnquiryRepository enquiryRepository;

    public AiController(
            GeminiService geminiService,
            EnquiryRepository enquiryRepository) {
        this.geminiService = geminiService;
        this.enquiryRepository = enquiryRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeEnquiry(
            @RequestBody Map<String, String> request) {

        String message = request.get("message");
        String enquiryIdValue = request.get("enquiryId");

        if (message == null || message.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Enquiry message is required."));
        }

        if (enquiryIdValue == null || enquiryIdValue.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Enquiry ID is required."));
        }

        Long enquiryId;

        try {
            enquiryId = Long.valueOf(enquiryIdValue);
        } catch (NumberFormatException error) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Invalid enquiry ID."));
        }

        Enquiry enquiry = enquiryRepository.findById(enquiryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Enquiry not found"
                ));

        String analysis = geminiService.analyzeEnquiry(message);

        enquiry.setAnalyzedAt(LocalDateTime.now());
        enquiryRepository.save(enquiry);

        return ResponseEntity
        .status(HttpStatus.OK)
        .body(Map.of(
                "analysis", analysis,
                "analyzedAt", enquiry.getAnalyzedAt().toString()
        ));
    }

    
@PostMapping("/chat")
public ResponseEntity<?> chatWithPatient(
        @RequestBody Map<String, String> request) {

    String message = request.get("message");

    if (message == null || message.isBlank()) {
        return ResponseEntity
                .badRequest()
                .body(Map.of("error", "Message cannot be empty."));
    }

    String reply = geminiService.chatWithPatient(message);

    return ResponseEntity
            .status(HttpStatus.OK)
            .body(Map.of("reply", reply));
}

}