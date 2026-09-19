package com.example.Moeen.jobtracking.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Moeen.jobtracking.domain.model.company.Company;
import com.example.Moeen.jobtracking.domain.model.opportunity.JobOpportunity;
import com.example.Moeen.jobtracking.domain.model.shared.SalaryCurrency;
import com.example.Moeen.jobtracking.dto.opportunity.CreateJobOpportunityRequest;
import com.example.Moeen.jobtracking.dto.opportunity.JobOpportunityResponse;
import com.example.Moeen.jobtracking.dto.opportunity.UpdateJobOpportunityRequest;
import com.example.Moeen.jobtracking.exception.InvalidOperationException;
import com.example.Moeen.jobtracking.exception.ResourceNotFoundException;
import com.example.Moeen.jobtracking.repository.CompanyRepository;
import com.example.Moeen.jobtracking.repository.JobOpportunityRepository;
import com.example.Moeen.jobtracking.service.mapper.JobTrackingMapper;

@Service
@Transactional(readOnly = true)
public class JobOpportunityService {

    private final JobOpportunityRepository jobOpportunityRepository;
    private final CompanyRepository companyRepository;
    private final JobTrackingMapper mapper;

    public JobOpportunityService(JobOpportunityRepository jobOpportunityRepository,
                                 CompanyRepository companyRepository,
                                 JobTrackingMapper mapper) {
        this.jobOpportunityRepository = jobOpportunityRepository;
        this.companyRepository = companyRepository;
        this.mapper = mapper;
    }

    @Transactional
    public JobOpportunityResponse createOpportunity(Long userId, CreateJobOpportunityRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new InvalidOperationException("Job title is required.");
        }
        if (request.companyId() == null) {
            throw new InvalidOperationException("Company ID is required.");
        }

        Company company = companyRepository.findByIdAndUserId(request.companyId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.companyId()));

        validateSalaries(request.minimumSalary(), request.maximumSalary(), request.salaryCurrency());
        validateDates(request.postingDate(), request.applicationDeadline());

        JobOpportunity opportunity = new JobOpportunity();
        opportunity.setUserId(userId);
        opportunity.setCompanyId(request.companyId());
        opportunity.setTitle(request.title().trim());
        opportunity.setDescription(request.description());
        opportunity.setJobUrl(request.jobUrl());
        opportunity.setSource(request.source());
        opportunity.setLocation(request.location());
        opportunity.setWorkArrangement(request.workArrangement());
        opportunity.setEmploymentType(request.employmentType());
        opportunity.setExperienceLevel(request.experienceLevel());
        opportunity.setMinimumSalary(request.minimumSalary());
        opportunity.setMaximumSalary(request.maximumSalary());
        opportunity.setSalaryCurrency(request.salaryCurrency());
        opportunity.setPostingDate(request.postingDate());
        opportunity.setApplicationDeadline(request.applicationDeadline());
        opportunity.setActive(true);

        JobOpportunity saved = jobOpportunityRepository.save(opportunity);
        return mapper.toJobOpportunityResponse(saved, company);
    }

    @Transactional
    public JobOpportunityResponse updateOpportunity(Long userId, Long opportunityId, UpdateJobOpportunityRequest request) {
        JobOpportunity opportunity = jobOpportunityRepository.findByIdAndUserId(opportunityId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opportunity not found with id: " + opportunityId));

        Company company = companyRepository.findByIdAndUserId(request.companyId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.companyId()));

        validateSalaries(request.minimumSalary(), request.maximumSalary(), request.salaryCurrency());
        validateDates(request.postingDate(), request.applicationDeadline());

        if (request.title() != null && !request.title().isBlank()) {
            opportunity.setTitle(request.title().trim());
        }
        opportunity.setCompanyId(request.companyId());
        opportunity.setDescription(request.description());
        opportunity.setJobUrl(request.jobUrl());
        opportunity.setSource(request.source());
        opportunity.setLocation(request.location());
        opportunity.setWorkArrangement(request.workArrangement());
        opportunity.setEmploymentType(request.employmentType());
        opportunity.setExperienceLevel(request.experienceLevel());
        opportunity.setMinimumSalary(request.minimumSalary());
        opportunity.setMaximumSalary(request.maximumSalary());
        opportunity.setSalaryCurrency(request.salaryCurrency());
        opportunity.setPostingDate(request.postingDate());
        opportunity.setApplicationDeadline(request.applicationDeadline());
        if (request.active() != null) {
            opportunity.setActive(request.active());
        }

        JobOpportunity updated = jobOpportunityRepository.save(opportunity);
        return mapper.toJobOpportunityResponse(updated, company);
    }

    public JobOpportunityResponse getOpportunityById(Long userId, Long opportunityId) {
        JobOpportunity opportunity = jobOpportunityRepository.findByIdAndUserId(opportunityId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opportunity not found with id: " + opportunityId));
        Company company = companyRepository.findByIdAndUserId(opportunity.getCompanyId(), userId).orElse(null);
        return mapper.toJobOpportunityResponse(opportunity, company);
    }

    public Page<JobOpportunityResponse> getOpportunities(Long userId, Pageable pageable) {
        return jobOpportunityRepository.findAllByUserId(userId, pageable)
                .map(opp -> {
                    Company company = companyRepository.findByIdAndUserId(opp.getCompanyId(), userId).orElse(null);
                    return mapper.toJobOpportunityResponse(opp, company);
                });
    }

    @Transactional
    public void deleteOpportunity(Long userId, Long opportunityId) {
        JobOpportunity opportunity = jobOpportunityRepository.findByIdAndUserId(opportunityId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opportunity not found with id: " + opportunityId));
        jobOpportunityRepository.delete(opportunity);
    }

    private void validateSalaries(BigDecimal min, BigDecimal max, SalaryCurrency currency) {
        if (min != null && min.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Minimum salary must be non-negative.");
        }
        if (max != null && max.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Maximum salary must be non-negative.");
        }
        if (min != null && max != null && max.compareTo(min) < 0) {
            throw new InvalidOperationException("Maximum salary cannot be less than minimum salary.");
        }
        if ((min != null || max != null) && currency == null) {
            throw new InvalidOperationException("Salary currency must be specified when salary amounts are present.");
        }
    }

    private void validateDates(LocalDate postingDate, LocalDate deadline) {
        if (postingDate != null && deadline != null && deadline.isBefore(postingDate)) {
            throw new InvalidOperationException("Application deadline cannot be earlier than posting date.");
        }
    }
}

