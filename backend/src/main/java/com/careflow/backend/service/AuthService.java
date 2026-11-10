
package com.careflow.backend.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.careflow.backend.dto.AuthResponse;
import com.careflow.backend.dto.LoginRequest;
import com.careflow.backend.dto.RegisterRequest;
import com.careflow.backend.entity.AppUser;
import com.careflow.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                "An account with this email already exists."
            );
        }

        AppUser user = new AppUser();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(
            passwordEncoder.encode(request.getPassword())
        );

        AppUser savedUser = userRepository.save(user);

        String message = "Account created successfully!";

        try {
            emailService.sendWelcomeEmail(
                savedUser.getEmail(),
                savedUser.getName()
            );
            message = "Account created successfully! Welcome email sent.";
        } catch (Exception e) {
            message = "Account created successfully, but the welcome email could not be sent.";
        }

        String token = jwtService.generateToken(savedUser.getEmail());

        return new AuthResponse(
            token,
            savedUser.getName(),
            savedUser.getEmail(),
            message
        );
    }

    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        Optional<AppUser> optionalUser =
            userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException(
                "Invalid email or password."
            );
        }

        AppUser user = optionalUser.get();

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                "Invalid email or password."
            );
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
            token,
            user.getName(),
            user.getEmail(),
            "Login successful!"
        );
    }
}
