package com.example.Moeen.jobtracking.dto.contact;

import com.example.Moeen.jobtracking.domain.model.contact.ContactType;

public record UpdateContactRequest(
        Long companyId,
        String fullName,
        String jobTitle,
        String email,
        String phone,
        String linkedinUrl,
        ContactType contactType,
        String notes
) {
}

