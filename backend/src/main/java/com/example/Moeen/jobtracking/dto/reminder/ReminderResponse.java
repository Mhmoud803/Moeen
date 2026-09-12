package com.example.Moeen.jobtracking.dto.reminder;

import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.application.ReminderStatus;

public record ReminderResponse(
        Long id,
        Long applicationId,
        String title,
        String description,
        Instant reminderAt,
        ReminderStatus status,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt
) {
}

