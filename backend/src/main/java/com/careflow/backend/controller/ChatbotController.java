
package com.careflow.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.careflow.backend.service.GeminiService;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    private final GeminiService geminiService;

    public ChatbotController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, String> request) {

        String message = request.get("message");

        if (message == null || message.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Message cannot be empty."));
        }

        if (message.length() > 2000) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Message is too long."));
        }

        String reply = geminiService.getChatbotResponse(message);

        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
