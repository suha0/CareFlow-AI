
package com.careflow.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.careflow.backend.dto.AuthResponse;
import com.careflow.backend.dto.ForgotPasswordRequest;
import com.careflow.backend.dto.LoginRequest;
import com.careflow.backend.dto.RegisterRequest;
import com.careflow.backend.dto.ResetPasswordRequest;
import com.careflow.backend.service.AuthService;
import com.careflow.backend.service.PasswordResetService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    private final PasswordResetService passwordResetService;

    public AuthController(
        AuthService authService,
        PasswordResetService passwordResetService) {

    this.authService = authService;
    this.passwordResetService = passwordResetService;
}
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(authService.register(request));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
    @PostMapping("/forgot-password")
public ResponseEntity<String> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request) {

    passwordResetService.forgotPassword(request);

    return ResponseEntity.ok(
            "If an account exists with that email, a password reset link will be sent."
    );
}
@PostMapping("/reset-password")
public ResponseEntity<String> resetPassword(
        @Valid @RequestBody ResetPasswordRequest request) {

    passwordResetService.resetPassword(request);

    return ResponseEntity.ok("Password reset successfully.");
}
}