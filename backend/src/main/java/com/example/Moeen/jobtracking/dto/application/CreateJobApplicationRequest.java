package com.example.Moeen.jobtracking.dto.application;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationPriority;

public record CreateJobApplicationRequest(
        Long jobOpportunityId,
        ApplicationPriority priority,
        Instant appliedAt,
        Instant followUpAt,
        BigDecimal expectedSalary,
        String notes
) {
}
