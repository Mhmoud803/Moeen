package com.example.Moeen.jobtracking.dto.document;

import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.application.DocumentType;

public record DocumentResponse(
        Long id,
        Long applicationId,
        String originalFilename,
        String contentType,
        Long fileSize,
        DocumentType documentType,
        Instant createdAt
) {
}

