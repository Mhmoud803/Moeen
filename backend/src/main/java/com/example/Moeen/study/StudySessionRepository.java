package com.example.Moeen.study;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByOwnerKeyAndStudiedOnBetweenOrderByCompletedAtDesc(
            String ownerKey, LocalDate from, LocalDate to);

    Optional<StudySession> findByIdAndOwnerKey(Long id, String ownerKey);
}
