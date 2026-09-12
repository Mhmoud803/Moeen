package com.example.Moeen.jobtracking.dto.company;

import com.example.Moeen.jobtracking.domain.model.company.CompanySize;

public record UpdateCompanyRequest(String name,String website,String linkedinUrl, String industry,CompanySize companySize,String headquarters, String description, Short rating) {

}
