
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

    public void sendPasswordResetEmail(String recipient, String resetLink) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(senderEmail);
    message.setTo(recipient);
    message.setSubject("Reset Your CareFlow AI Password");
    message.setText(
        "Hello,\n\n" +
        "We received a request to reset your CareFlow AI password.\n\n" +
        "Click the link below to set a new password:\n" +
        resetLink + "\n\n" +
        "This link will expire in 15 minutes.\n\n" +
        "If you did not request this, you can ignore this email.\n\n" +
        "CareFlow AI Team"
    );

    mailSender.send(message);
}
}
