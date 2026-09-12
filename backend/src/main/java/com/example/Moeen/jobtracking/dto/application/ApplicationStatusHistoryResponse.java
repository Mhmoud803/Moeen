package com.example.Moeen.jobtracking.dto.application;

import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;

public record ApplicationStatusHistoryResponse(
        Long id,
        Long applicationId,
        ApplicationStatus previousStatus,
        ApplicationStatus newStatus,
        String comment,
        Instant changedAt
) {
}

