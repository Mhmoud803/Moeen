package com.example.Moeen.jobtracking.dto.reminder;

import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.application.ReminderStatus;

public record UpdateReminderRequest(
        String title,
        String description,
        Instant reminderAt,
        ReminderStatus status
) {
}

