package com.example.Moeen.jobtracking.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Moeen.jobtracking.domain.model.company.Company;
import com.example.Moeen.jobtracking.dto.company.CompanyResponse;
import com.example.Moeen.jobtracking.dto.company.CompanySummaryResponse;
import com.example.Moeen.jobtracking.dto.company.CreateCompanyRequest;
import com.example.Moeen.jobtracking.dto.company.UpdateCompanyRequest;
import com.example.Moeen.jobtracking.exception.DuplicateResourceException;
import com.example.Moeen.jobtracking.exception.InvalidOperationException;
import com.example.Moeen.jobtracking.exception.ResourceNotFoundException;
import com.example.Moeen.jobtracking.repository.CompanyRepository;
import com.example.Moeen.jobtracking.service.mapper.JobTrackingMapper;

@Service
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final JobTrackingMapper mapper;

    public CompanyService(CompanyRepository companyRepository, JobTrackingMapper mapper) {
        this.companyRepository = companyRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CompanyResponse createCompany(Long userId, CreateCompanyRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new InvalidOperationException("Company name is required.");
        }
        String trimmedName = request.name().trim();
        if (companyRepository.existsByUserIdAndNameIgnoreCase(userId, trimmedName)) {
            throw new DuplicateResourceException("Company with name '" + trimmedName + "' already exists.");
        }
        validateRating(request.rating());

        Company company = new Company();
        company.setUserId(userId);
        company.setName(trimmedName);
        company.setWebsite(request.website());
        company.setLinkedinUrl(request.linkedinUrl());
        company.setIndustry(request.industry());
        company.setCompanySize(request.companySize());
        company.setHeadquarters(request.headquarters());
        company.setDescription(request.description());
        company.setRating(request.rating());

        Company saved = companyRepository.save(company);
        return mapper.toCompanyResponse(saved);
    }

    @Transactional
    public CompanyResponse updateCompany(Long userId, Long companyId, UpdateCompanyRequest request) {
        Company company = companyRepository.findByIdAndUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        if (request.name() != null && !request.name().isBlank()) {
            String trimmedName = request.name().trim();
            if (!trimmedName.equalsIgnoreCase(company.getName()) &&
                    companyRepository.existsByUserIdAndNameIgnoreCase(userId, trimmedName)) {
                throw new DuplicateResourceException("Company with name '" + trimmedName + "' already exists.");
            }
            company.setName(trimmedName);
        }

        validateRating(request.rating());

        company.setWebsite(request.website());
        company.setLinkedinUrl(request.linkedinUrl());
        company.setIndustry(request.industry());
        company.setCompanySize(request.companySize());
        company.setHeadquarters(request.headquarters());
        company.setDescription(request.description());
        company.setRating(request.rating());

        Company updated = companyRepository.save(company);
        return mapper.toCompanyResponse(updated);
    }

    public CompanyResponse getCompanyById(Long userId, Long companyId) {
        Company company = companyRepository.findByIdAndUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
        return mapper.toCompanyResponse(company);
    }

    public Page<CompanyResponse> getCompanies(Long userId, Pageable pageable) {
        return companyRepository.findAllByUserId(userId, pageable)
                .map(mapper::toCompanyResponse);
    }

    public List<CompanySummaryResponse> getCompanySummaries(Long userId) {
        return companyRepository.findAllByUserIdOrderByNameAsc(userId).stream()
                .map(mapper::toCompanySummaryResponse)
                .toList();
    }

    @Transactional
    public void deleteCompany(Long userId, Long companyId) {
        Company company = companyRepository.findByIdAndUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
        companyRepository.delete(company);
    }

    private void validateRating(Short rating) {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new InvalidOperationException("Rating must be between 1 and 5.");
        }
    }
}
