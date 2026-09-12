package com.example.Moeen.jobtracking.dto.application;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;

public record ChangeApplicationStatusRequest(
        ApplicationStatus newStatus,
        String comment
) {
}

