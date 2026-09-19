package com.example.Moeen.jobtracking.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationPriority;
import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;
import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatusHistory;
import com.example.Moeen.jobtracking.domain.model.application.JobApplication;
import com.example.Moeen.jobtracking.domain.model.company.Company;
import com.example.Moeen.jobtracking.domain.model.opportunity.JobOpportunity;
import com.example.Moeen.jobtracking.dto.application.ApplicationStatusHistoryResponse;
import com.example.Moeen.jobtracking.dto.application.ChangeApplicationStatusRequest;
import com.example.Moeen.jobtracking.dto.application.CreateJobApplicationRequest;
import com.example.Moeen.jobtracking.dto.application.JobApplicationResponse;
import com.example.Moeen.jobtracking.dto.application.JobApplicationSummaryResponse;
import com.example.Moeen.jobtracking.dto.application.UpdateJobApplicationRequest;
import com.example.Moeen.jobtracking.dto.opportunity.JobOpportunityResponse;
import com.example.Moeen.jobtracking.exception.DuplicateResourceException;
import com.example.Moeen.jobtracking.exception.InvalidOperationException;
import com.example.Moeen.jobtracking.exception.ResourceNotFoundException;
import com.example.Moeen.jobtracking.repository.ApplicationStatusHistoryRepository;
import com.example.Moeen.jobtracking.repository.CompanyRepository;
import com.example.Moeen.jobtracking.repository.JobApplicationRepository;
import com.example.Moeen.jobtracking.repository.JobOpportunityRepository;
import com.example.Moeen.jobtracking.service.mapper.JobTrackingMapper;

@Service
@Transactional(readOnly = true)
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobOpportunityRepository jobOpportunityRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final JobTrackingMapper mapper;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
                                 JobOpportunityRepository jobOpportunityRepository,
                                 CompanyRepository companyRepository,
                                 ApplicationStatusHistoryRepository statusHistoryRepository,
                                 JobTrackingMapper mapper) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobOpportunityRepository = jobOpportunityRepository;
        this.companyRepository = companyRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.mapper = mapper;
    }

    @Transactional
    public JobApplicationResponse createApplication(Long userId, CreateJobApplicationRequest request) {
        if (request.jobOpportunityId() == null) {
            throw new InvalidOperationException("Job opportunity ID is required.");
        }

        JobOpportunity opportunity = jobOpportunityRepository.findByIdAndUserId(request.jobOpportunityId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opportunity not found with id: " + request.jobOpportunityId()));

        if (jobApplicationRepository.existsByJobOpportunityId(request.jobOpportunityId())) {
            throw new DuplicateResourceException("An application already exists for job opportunity id: " + request.jobOpportunityId());
        }

        Instant appliedAt = request.appliedAt() != null ? request.appliedAt() : Instant.now();
        validateFollowUpDate(appliedAt, request.followUpAt());
        validateSalary(request.expectedSalary());

        JobApplication application = new JobApplication();
        application.setUserId(userId);
        application.setJobOpportunityId(opportunity.getId());
        application.setCurrentStatus(ApplicationStatus.APPLIED);
        application.setPriority(request.priority() != null ? request.priority() : ApplicationPriority.MEDIUM);
        application.setAppliedAt(appliedAt);
        application.setFollowUpAt(request.followUpAt());
        application.setExpectedSalary(request.expectedSalary());
        application.setNotes(request.notes());

        JobApplication saved = jobApplicationRepository.save(application);

        // Record initial state in status history
        ApplicationStatusHistory initialHistory = new ApplicationStatusHistory();
        initialHistory.setApplicationId(saved.getId());
        initialHistory.setPreviousStatus(null);
        initialHistory.setNewStatus(ApplicationStatus.APPLIED);
        initialHistory.setComment("Application recorded as APPLIED");
        initialHistory.setChangedAt(appliedAt);
        statusHistoryRepository.save(initialHistory);

        Company company = companyRepository.findByIdAndUserId(opportunity.getCompanyId(), userId).orElse(null);
        JobOpportunityResponse opportunityResponse = mapper.toJobOpportunityResponse(opportunity, company);
        return mapper.toJobApplicationResponse(saved, opportunityResponse);
    }

    @Transactional
    public JobApplicationResponse changeStatus(Long userId, Long applicationId, ChangeApplicationStatusRequest request) {
        if (request.newStatus() == null) {
            throw new InvalidOperationException("New status must be provided.");
        }

        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        if (application.getCurrentStatus() == request.newStatus()) {
            throw new InvalidOperationException("Application is already in status: " + request.newStatus());
        }

        ApplicationStatus previousStatus = application.getCurrentStatus();
        application.setCurrentStatus(request.newStatus());
        JobApplication updated = jobApplicationRepository.save(application);

        // Atomic audit recording
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        history.setApplicationId(applicationId);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(request.newStatus());
        history.setComment(request.comment());
        history.setChangedAt(Instant.now());
        statusHistoryRepository.save(history);

        JobOpportunity opportunity = jobOpportunityRepository.findByIdAndUserId(updated.getJobOpportunityId(), userId).orElse(null);
        Company company = opportunity != null
                ? companyRepository.findByIdAndUserId(opportunity.getCompanyId(), userId).orElse(null)
                : null;
        JobOpportunityResponse opportunityResponse = mapper.toJobOpportunityResponse(opportunity, company);

        return mapper.toJobApplicationResponse(updated, opportunityResponse);
    }

    @Transactional
    public JobApplicationResponse updateApplication(Long userId, Long applicationId, UpdateJobApplicationRequest request) {
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        Instant appliedAt = request.appliedAt() != null ? request.appliedAt() : application.getAppliedAt();
        validateFollowUpDate(appliedAt, request.followUpAt());
        validateSalary(request.expectedSalary());

        if (request.priority() != null) {
            application.setPriority(request.priority());
        }
        application.setAppliedAt(appliedAt);
        application.setFollowUpAt(request.followUpAt());
        application.setExpectedSalary(request.expectedSalary());
        application.setNotes(request.notes());

        JobApplication updated = jobApplicationRepository.save(application);

        JobOpportunity opportunity = jobOpportunityRepository.findByIdAndUserId(updated.getJobOpportunityId(), userId).orElse(null);
        Company company = opportunity != null
                ? companyRepository.findByIdAndUserId(opportunity.getCompanyId(), userId).orElse(null)
                : null;
        JobOpportunityResponse opportunityResponse = mapper.toJobOpportunityResponse(opportunity, company);

        return mapper.toJobApplicationResponse(updated, opportunityResponse);
    }

    public JobApplicationResponse getApplicationById(Long userId, Long applicationId) {
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        JobOpportunity opportunity = jobOpportunityRepository.findByIdAndUserId(application.getJobOpportunityId(), userId).orElse(null);
        Company company = opportunity != null
                ? companyRepository.findByIdAndUserId(opportunity.getCompanyId(), userId).orElse(null)
                : null;
        JobOpportunityResponse opportunityResponse = mapper.toJobOpportunityResponse(opportunity, company);

        return mapper.toJobApplicationResponse(application, opportunityResponse);
    }

    public List<JobApplicationSummaryResponse> getApplications(Long userId, ApplicationStatus status, ApplicationPriority priority) {
        List<JobApplication> applications;
        if (status != null) {
            applications = jobApplicationRepository.findAllByUserIdAndCurrentStatus(userId, status);
        } else {
            applications = jobApplicationRepository.findAllByUserId(userId);
        }

        if (priority != null) {
            applications = applications.stream().filter(a -> a.getPriority() == priority).toList();
        }

        Map<Long, JobOpportunity> opportunityMap = jobOpportunityRepository.findAllByUserId(userId).stream()
                .collect(Collectors.toMap(JobOpportunity::getId, o -> o));

        Map<Long, Company> companyMap = companyRepository.findAllByUserIdOrderByNameAsc(userId).stream()
                .collect(Collectors.toMap(Company::getId, c -> c));

        return applications.stream().map(app -> {
            JobOpportunity opp = opportunityMap.get(app.getJobOpportunityId());
            String jobTitle = opp != null ? opp.getTitle() : "Unknown Opportunity";
            String companyName = (opp != null && companyMap.containsKey(opp.getCompanyId()))
                    ? companyMap.get(opp.getCompanyId()).getName()
                    : "Unknown Company";
            return mapper.toJobApplicationSummaryResponse(app, jobTitle, companyName);
        }).toList();
    }

    public List<ApplicationStatusHistoryResponse> getStatusHistory(Long userId, Long applicationId) {
        if (!jobApplicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("Job application not found with id: " + applicationId);
        }
        return statusHistoryRepository.findAllByApplicationIdOrderByChangedAtDesc(applicationId).stream()
                .map(mapper::toStatusHistoryResponse)
                .toList();
    }

    @Transactional
    public void deleteApplication(Long userId, Long applicationId) {
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));
        statusHistoryRepository.deleteAllByApplicationId(applicationId);
        jobApplicationRepository.delete(application);
    }

    private void validateFollowUpDate(Instant appliedAt, Instant followUpAt) {
        if (appliedAt != null && followUpAt != null && followUpAt.isBefore(appliedAt)) {
            throw new InvalidOperationException("Follow-up date cannot be earlier than applied date.");
        }
    }

    private void validateSalary(BigDecimal salary) {
        if (salary != null && salary.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Expected salary must be non-negative.");
        }
    }
}

