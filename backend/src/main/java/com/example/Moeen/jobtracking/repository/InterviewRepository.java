package com.example.Moeen.jobtracking.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.application.Interview;
import com.example.Moeen.jobtracking.domain.model.application.InterviewResult;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    Optional<Interview> findByIdAndApplicationId(Long id, Long applicationId);

    List<Interview> findAllByApplicationIdOrderByScheduledAtAsc(Long applicationId);

    @Query("""
        SELECT i FROM Interview i
        JOIN JobApplication a ON i.applicationId = a.id
        WHERE a.userId = :userId
          AND i.scheduledAt >= :now
          AND i.result = :result
        ORDER BY i.scheduledAt ASC
    """)
    List<Interview> findUpcomingByUserId(
            @Param("userId") Long userId,
            @Param("now") Instant now,
            @Param("result") InterviewResult result
    );

    void deleteAllByApplicationId(Long applicationId);
}

