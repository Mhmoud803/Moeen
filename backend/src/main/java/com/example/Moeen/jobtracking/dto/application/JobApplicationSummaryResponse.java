package com.example.Moeen.jobtracking.dto.application;

import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationPriority;
import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;

public record JobApplicationSummaryResponse(
        Long id,
        Long jobOpportunityId,
        String jobTitle,
        String companyName,
        ApplicationStatus currentStatus,
        ApplicationPriority priority,
        Instant appliedAt,
        Instant followUpAt
) {
}

