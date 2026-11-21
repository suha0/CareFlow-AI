
package com.careflow.backend.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger log =
        LoggerFactory.getLogger(AuthService.class);

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

    String token = jwtService.generateToken(savedUser.getEmail());

    return new AuthResponse(
        token,
        savedUser.getName(),
        savedUser.getEmail(),
        "Account created successfully!"
    );
}

public AuthResponse login(LoginRequest request) {

    long totalStart = System.nanoTime();

    String email = request.getEmail().trim().toLowerCase();

    long dbStart = System.nanoTime();

    Optional<AppUser> optionalUser =
            userRepository.findByEmail(email);

    long dbTime =
            (System.nanoTime() - dbStart) / 1_000_000;

    if (optionalUser.isEmpty()) {
        throw new IllegalArgumentException(
                "Invalid email or password."
        );
    }

    AppUser user = optionalUser.get();

    long passwordStart = System.nanoTime();

    boolean passwordMatches = passwordEncoder.matches(
            request.getPassword(),
            user.getPassword()
    );

    long passwordTime =
            (System.nanoTime() - passwordStart) / 1_000_000;

    if (!passwordMatches) {
        throw new IllegalArgumentException(
                "Invalid email or password."
        );
    }

    long jwtStart = System.nanoTime();

    String token = jwtService.generateToken(user.getEmail());

    long jwtTime =
            (System.nanoTime() - jwtStart) / 1_000_000;

    long totalTime =
            (System.nanoTime() - totalStart) / 1_000_000;

    log.info(
            "LOGIN TIMING | DB={}ms | BCrypt={}ms | JWT={}ms | TOTAL={}ms",
            dbTime,
            passwordTime,
            jwtTime,
            totalTime
    );

    return new AuthResponse(
            token,
            user.getName(),
            user.getEmail(),
            "Login successful!"
    );
}

}
