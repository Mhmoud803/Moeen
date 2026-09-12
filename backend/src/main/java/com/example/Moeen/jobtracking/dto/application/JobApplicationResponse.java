package com.example.Moeen.jobtracking.dto.application;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationPriority;
import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;
import com.example.Moeen.jobtracking.dto.opportunity.JobOpportunityResponse;

public record JobApplicationResponse(
        Long id,
        Long jobOpportunityId,
        JobOpportunityResponse jobOpportunity,
        ApplicationStatus currentStatus,
        ApplicationPriority priority,
        Instant appliedAt,
        Instant followUpAt,
        BigDecimal expectedSalary,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}

