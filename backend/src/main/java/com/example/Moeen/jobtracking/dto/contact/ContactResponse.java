package com.example.Moeen.jobtracking.dto.contact;

import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.contact.ContactType;
import com.example.Moeen.jobtracking.dto.company.CompanySummaryResponse;

public record ContactResponse(
        Long id,
        Long companyId,
        CompanySummaryResponse company,
        String fullName,
        String jobTitle,
        String email,
        String phone,
        String linkedinUrl,
        ContactType contactType,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}

