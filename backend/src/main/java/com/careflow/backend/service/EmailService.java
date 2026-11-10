
package com.careflow.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String recipient, String name) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(recipient);
        message.setSubject("Welcome to CareFlow AI!");

        message.setText(
            "Hello " + name + ",\n\n" +
            "Welcome to CareFlow AI!\n\n" +
            "Your account has been successfully created.\n" +
            "You can now sign in and explore CareFlow AI.\n\n" +
            "Thank you for joining us!\n\n" +
            "CareFlow AI Team"
        );

        mailSender.send(message);
    }
}
