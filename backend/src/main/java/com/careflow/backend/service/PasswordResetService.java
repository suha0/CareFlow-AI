package com.careflow.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.careflow.backend.dto.ForgotPasswordRequest;
import com.careflow.backend.dto.ResetPasswordRequest;
import com.careflow.backend.entity.AppUser;
import com.careflow.backend.entity.PasswordResetToken;
import com.careflow.backend.repository.PasswordResetTokenRepository;
import com.careflow.backend.repository.UserRepository;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());

        String email = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(email).ifPresent(user -> {
            tokenRepository.deleteByUser(user);

            byte[] randomBytes = new byte[32];
            secureRandom.nextBytes(randomBytes);

            String rawToken = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(randomBytes);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setTokenHash(hashToken(rawToken));
            resetToken.setUser(user);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));

            tokenRepository.save(resetToken);

            String resetLink =
                    "http://localhost:5173/reset-password?token=" + rawToken;

            try {
    emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
} catch (Exception e) {
    tokenRepository.delete(resetToken);
    System.err.println("Password reset email could not be sent: " + e.getMessage());
}
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        String tokenHash = hashToken(request.getToken());

        PasswordResetToken resetToken = tokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or expired password reset link."
                ));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException(
                    "Invalid or expired password reset link."
            );
        }

        AppUser user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
        tokenRepository.delete(resetToken);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );
            return HexFormat.of().formatHex(hash);

        } catch (Exception e) {
            throw new IllegalStateException("Unable to process reset token.");
        }
    }
}