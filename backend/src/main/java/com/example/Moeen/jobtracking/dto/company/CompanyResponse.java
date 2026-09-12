package com.example.Moeen.jobtracking.dto.company;

import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.company.CompanySize;

public record CompanyResponse(Long id, String name,String website,String linkedinUrl, String industry, CompanySize companySize, String headquarters, String description, Short rating, Instant createdAt, Instant updatedAt) {

}
