
package com.careflow.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GeminiService {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    public GeminiService() {
    this.restClient = RestClient.create();
    }

    public String analyzeEnquiry(String message) {

        String prompt = """
                You are an administrative assistant for a healthcare enquiry
                management system called CareFlow AI.

                Analyze the following patient enquiry for administrative purposes.

                Identify:
                1. Category: APPOINTMENT, BILLING, RESCHEDULING,
                   GENERAL, or MEDICAL_REVIEW.
                2. Priority: LOW, MEDIUM, or HIGH.
                3. A short, polite draft response from the clinic's
                   administrative team.

                Important rules:
                - Do not diagnose medical conditions.
                - Do not recommend medicines or treatments.
                - If the message mentions potentially urgent symptoms,
                  mark it HIGH priority and recommend immediate human review.
                - Never present the draft as medical advice.

                Return the result in a clear, readable format.

                Patient enquiry:
                """ + message;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        Map<?, ?> response = restClient.post()
                .uri(
                        "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                        model
                )
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException("Gemini returned an empty response.");
        }

        List<?> candidates = (List<?>) response.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            throw new IllegalStateException("Gemini did not return any analysis.");
        }

        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
        List<?> parts = (List<?>) content.get("parts");
        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

        return String.valueOf(firstPart.get("text"));
    }

        public String chatWithPatient(String message) {

        String prompt = """
                You are CareFlow AI, a friendly virtual assistant
                for patients contacting a healthcare clinic.

                Your responsibilities:
                1. Answer general questions about clinic enquiries.
                2. Explain how patients can request, reschedule,
                   or enquire about appointments.
                3. Help patients understand the enquiry process.
                4. Respond politely, clearly, and concisely.

                Important safety rules:
                - You are not a doctor.
                - Never diagnose medical conditions.
                - Never recommend medicines, dosages, or treatments.
                - Do not claim that an appointment is booked or confirmed.
                - Do not invent clinic details, doctors, fees, or opening hours.
                  If specific information is unavailable, direct the patient
                  to contact the clinic team.
                - If the patient describes potentially urgent symptoms
                  such as chest pain, difficulty breathing, severe bleeding,
                  or stroke symptoms, tell them to seek emergency medical
                  care immediately or contact local emergency services.
                  Do not delay emergency care for a chat response.
                - Keep your responses warm, simple, and helpful.

                Patient message:
                """ + message;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        Map<?, ?> response = restClient.post()
                .uri(
                        "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                        model
                )
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException("Gemini returned an empty response.");
        }

        List<?> candidates = (List<?>) response.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            throw new IllegalStateException("Gemini did not return a chatbot response.");
        }

        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
        List<?> parts = (List<?>) content.get("parts");
        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

        return String.valueOf(firstPart.get("text"));
    }
    

public String getChatbotResponse(String message) {

    String prompt = """
            You are CareFlow AI's patient support chatbot.

            Your role is to help patients with general healthcare
            administrative enquiries.

            You can:
            - Explain how patients can submit appointment requests.
            - Help with general appointment and rescheduling questions.
            - Answer basic billing and enquiry-process questions.
            - Guide patients on how to contact the clinic.
            - Help patients understand how to submit an enquiry.

            Important safety rules:
            - Do not diagnose diseases or medical conditions.
            - Do not recommend medicines, treatments, or dosages.
            - Do not claim that an appointment has been booked.
            - Do not invent clinic details, prices, availability, or policies.
            - If you do not know something, politely suggest contacting
              the clinic's administrative team.
            - If a patient reports potentially urgent symptoms such as
              chest pain, difficulty breathing, severe bleeding, or
              stroke symptoms, advise them to seek emergency medical
              attention immediately. Do not delay care.
            - Keep responses polite, empathetic, and concise.

            Patient message:
            """ + message;

    Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                    Map.of(
                            "parts", List.of(
                                    Map.of("text", prompt)
                            )
                    )
            )
    );

    Map<?, ?> response = restClient.post()
            .uri(
                    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    model
            )
            .header("x-goog-api-key", apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .body(requestBody)
            .retrieve()
            .body(Map.class);

    if (response == null) {
        throw new IllegalStateException("Gemini returned an empty response.");
    }

    List<?> candidates = (List<?>) response.get("candidates");

    if (candidates == null || candidates.isEmpty()) {
        throw new IllegalStateException("Gemini did not return a response.");
    }

    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
    List<?> parts = (List<?>) content.get("parts");
    Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

    return String.valueOf(firstPart.get("text"));
}


}
