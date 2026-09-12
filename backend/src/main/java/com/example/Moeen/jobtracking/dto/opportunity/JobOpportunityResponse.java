package com.example.Moeen.jobtracking.dto.opportunity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.example.Moeen.jobtracking.domain.model.opportunity.EmploymentType;
import com.example.Moeen.jobtracking.domain.model.opportunity.ExperienceLevel;
import com.example.Moeen.jobtracking.domain.model.opportunity.WorkArrangement;
import com.example.Moeen.jobtracking.domain.model.shared.SalaryCurrency;
import com.example.Moeen.jobtracking.dto.company.CompanySummaryResponse;

public record JobOpportunityResponse(
        Long id,
        Long companyId,
        String title,
        String description,
        String jobUrl,
        String source,
        String location,
        WorkArrangement workArrangement,
        EmploymentType employmentType,
        ExperienceLevel experienceLevel,
        BigDecimal minimumSalary,
        BigDecimal maximumSalary,
        SalaryCurrency salaryCurrency,
        LocalDate postingDate,
        LocalDate applicationDeadline,
        Boolean active,
        CompanySummaryResponse company,
        Instant createdAt,
        Instant updatedAt
) {
}
