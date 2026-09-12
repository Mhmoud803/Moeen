package com.example.Moeen.jobtracking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.application.Reminder;
import com.example.Moeen.jobtracking.domain.model.application.ReminderStatus;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    Optional<Reminder> findByIdAndApplicationId(Long id, Long applicationId);

    List<Reminder> findAllByApplicationIdOrderByReminderAtAsc(Long applicationId);

    @Query("""
        SELECT r FROM Reminder r
        JOIN JobApplication a ON r.applicationId = a.id
        WHERE a.userId = :userId
          AND r.status = :status
        ORDER BY r.reminderAt ASC
    """)
    List<Reminder> findByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("status") ReminderStatus status
    );

    void deleteAllByApplicationId(Long applicationId);
}

