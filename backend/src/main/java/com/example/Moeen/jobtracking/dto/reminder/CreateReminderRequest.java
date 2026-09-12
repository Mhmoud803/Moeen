package com.example.Moeen.jobtracking.dto.reminder;

import java.time.Instant;

public record CreateReminderRequest(
        String title,
        String description,
        Instant reminderAt
) {
}

