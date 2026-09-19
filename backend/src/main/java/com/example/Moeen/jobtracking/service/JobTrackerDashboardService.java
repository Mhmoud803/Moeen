package com.example.Moeen.jobtracking.service;

import java.time.Duration;
import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;
import com.example.Moeen.jobtracking.domain.model.application.InterviewResult;
import com.example.Moeen.jobtracking.domain.model.application.JobApplication;
import com.example.Moeen.jobtracking.domain.model.application.ReminderStatus;
import com.example.Moeen.jobtracking.domain.model.company.Company;
import com.example.Moeen.jobtracking.domain.model.opportunity.JobOpportunity;
import com.example.Moeen.jobtracking.dto.application.JobApplicationSummaryResponse;
import com.example.Moeen.jobtracking.dto.dashboard.JobTrackerDashboardResponse;
import com.example.Moeen.jobtracking.dto.interview.InterviewResponse;
import com.example.Moeen.jobtracking.dto.reminder.ReminderResponse;
import com.example.Moeen.jobtracking.repository.CompanyRepository;
import com.example.Moeen.jobtracking.repository.InterviewRepository;
import com.example.Moeen.jobtracking.repository.JobApplicationRepository;
import com.example.Moeen.jobtracking.repository.JobOpportunityRepository;
import com.example.Moeen.jobtracking.repository.ReminderRepository;
import com.example.Moeen.jobtracking.service.mapper.JobTrackingMapper;

@Service
@Transactional(readOnly = true)
public class JobTrackerDashboardService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobOpportunityRepository jobOpportunityRepository;
    private final CompanyRepository companyRepository;
    private final InterviewRepository interviewRepository;
    private final ReminderRepository reminderRepository;
    private final JobTrackingMapper mapper;

    public JobTrackerDashboardService(JobApplicationRepository jobApplicationRepository,
                                     JobOpportunityRepository jobOpportunityRepository,
                                     CompanyRepository companyRepository,
                                     InterviewRepository interviewRepository,
                                     ReminderRepository reminderRepository,
                                     JobTrackingMapper mapper) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobOpportunityRepository = jobOpportunityRepository;
        this.companyRepository = companyRepository;
        this.interviewRepository = interviewRepository;
        this.reminderRepository = reminderRepository;
        this.mapper = mapper;
    }

    public JobTrackerDashboardResponse getDashboardSummary(Long userId) {
        long totalApplications = jobApplicationRepository.countByUserId(userId);

        Map<ApplicationStatus, Long> statusCounts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = jobApplicationRepository.countByUserIdAndCurrentStatus(userId, status);
            statusCounts.put(status, count);
        }

        Instant now = Instant.now();
        Instant upcomingWindow = now.plus(Duration.ofDays(14));
        List<JobApplication> followUpApplications = jobApplicationRepository.findAllByUserIdAndFollowUpAtBetween(userId, now, upcomingWindow);

        Map<Long, JobOpportunity> opportunityMap = jobOpportunityRepository.findAllByUserId(userId).stream()
                .collect(Collectors.toMap(JobOpportunity::getId, o -> o));

        Map<Long, Company> companyMap = companyRepository.findAllByUserIdOrderByNameAsc(userId).stream()
                .collect(Collectors.toMap(Company::getId, c -> c));

        List<JobApplicationSummaryResponse> upcomingFollowUps = followUpApplications.stream().map(app -> {
            JobOpportunity opp = opportunityMap.get(app.getJobOpportunityId());
            String jobTitle = opp != null ? opp.getTitle() : "Unknown Opportunity";
            String companyName = (opp != null && companyMap.containsKey(opp.getCompanyId()))
                    ? companyMap.get(opp.getCompanyId()).getName()
                    : "Unknown Company";
            return mapper.toJobApplicationSummaryResponse(app, jobTitle, companyName);
        }).toList();

        List<InterviewResponse> upcomingInterviews = interviewRepository
                .findUpcomingByUserId(userId, now, InterviewResult.SCHEDULED).stream()
                .map(mapper::toInterviewResponse)
                .toList();

        List<ReminderResponse> pendingReminders = reminderRepository
                .findByUserIdAndStatus(userId, ReminderStatus.PENDING).stream()
                .map(mapper::toReminderResponse)
                .toList();

        return new JobTrackerDashboardResponse(
                totalApplications,
                statusCounts,
                upcomingFollowUps,
                upcomingInterviews,
                pendingReminders
        );
    }
}

