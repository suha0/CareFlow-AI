
package com.careflow.backend.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.careflow.backend.entity.AppUser;
import com.careflow.backend.entity.PasswordResetToken;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    void deleteByUser(AppUser user);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
