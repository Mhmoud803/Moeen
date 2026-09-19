package com.example.Moeen.jobtracking.service.mapper;

import org.springframework.stereotype.Component;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatusHistory;
import com.example.Moeen.jobtracking.domain.model.application.Document;
import com.example.Moeen.jobtracking.domain.model.application.Interview;
import com.example.Moeen.jobtracking.domain.model.application.JobApplication;
import com.example.Moeen.jobtracking.domain.model.application.Reminder;
import com.example.Moeen.jobtracking.domain.model.company.Company;
import com.example.Moeen.jobtracking.domain.model.contact.Contact;
import com.example.Moeen.jobtracking.domain.model.opportunity.JobOpportunity;
import com.example.Moeen.jobtracking.dto.application.ApplicationStatusHistoryResponse;
import com.example.Moeen.jobtracking.dto.application.JobApplicationResponse;
import com.example.Moeen.jobtracking.dto.application.JobApplicationSummaryResponse;
import com.example.Moeen.jobtracking.dto.company.CompanyResponse;
import com.example.Moeen.jobtracking.dto.company.CompanySummaryResponse;
import com.example.Moeen.jobtracking.dto.contact.ContactResponse;
import com.example.Moeen.jobtracking.dto.document.DocumentResponse;
import com.example.Moeen.jobtracking.dto.interview.InterviewResponse;
import com.example.Moeen.jobtracking.dto.opportunity.JobOpportunityResponse;
import com.example.Moeen.jobtracking.dto.reminder.ReminderResponse;

@Component
public class JobTrackingMapper {

    public CompanyResponse toCompanyResponse(Company company) {
        if (company == null) return null;
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getWebsite(),
                company.getLinkedinUrl(),
                company.getIndustry(),
                company.getCompanySize(),
                company.getHeadquarters(),
                company.getDescription(),
                company.getRating(),
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }

    public CompanySummaryResponse toCompanySummaryResponse(Company company) {
        if (company == null) return null;
        return new CompanySummaryResponse(
                company.getId(),
                company.getName(),
                company.getIndustry()
        );
    }

    public ContactResponse toContactResponse(Contact contact, Company company) {
        if (contact == null) return null;
        CompanySummaryResponse companySummary = company != null ? toCompanySummaryResponse(company) : null;
        return new ContactResponse(
                contact.getId(),
                contact.getCompanyId(),
                companySummary,
                contact.getFullName(),
                contact.getJobTitle(),
                contact.getEmail(),
                contact.getPhone(),
                contact.getLinkedinUrl(),
                contact.getContactType(),
                contact.getNotes(),
                contact.getCreatedAt(),
                contact.getUpdatedAt()
        );
    }

    public JobOpportunityResponse toJobOpportunityResponse(JobOpportunity opportunity, Company company) {
        if (opportunity == null) return null;
        CompanySummaryResponse companySummary = company != null ? toCompanySummaryResponse(company) : null;
        return new JobOpportunityResponse(
                opportunity.getId(),
                opportunity.getCompanyId(),
                opportunity.getTitle(),
                opportunity.getDescription(),
                opportunity.getJobUrl(),
                opportunity.getSource(),
                opportunity.getLocation(),
                opportunity.getWorkArrangement(),
                opportunity.getEmploymentType(),
                opportunity.getExperienceLevel(),
                opportunity.getMinimumSalary(),
                opportunity.getMaximumSalary(),
                opportunity.getSalaryCurrency(),
                opportunity.getPostingDate(),
                opportunity.getApplicationDeadline(),
                opportunity.getActive(),
                companySummary,
                opportunity.getCreatedAt(),
                opportunity.getUpdatedAt()
        );
    }

    public JobApplicationResponse toJobApplicationResponse(JobApplication application, JobOpportunityResponse opportunityResponse) {
        if (application == null) return null;
        return new JobApplicationResponse(
                application.getId(),
                application.getJobOpportunityId(),
                opportunityResponse,
                application.getCurrentStatus(),
                application.getPriority(),
                application.getAppliedAt(),
                application.getFollowUpAt(),
                application.getExpectedSalary(),
                application.getNotes(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }

    public JobApplicationSummaryResponse toJobApplicationSummaryResponse(JobApplication application, String jobTitle, String companyName) {
        if (application == null) return null;
        return new JobApplicationSummaryResponse(
                application.getId(),
                application.getJobOpportunityId(),
                jobTitle,
                companyName,
                application.getCurrentStatus(),
                application.getPriority(),
                application.getAppliedAt(),
                application.getFollowUpAt()
        );
    }

    public ApplicationStatusHistoryResponse toStatusHistoryResponse(ApplicationStatusHistory history) {
        if (history == null) return null;
        return new ApplicationStatusHistoryResponse(
                history.getId(),
                history.getApplicationId(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getComment(),
                history.getChangedAt()
        );
    }

    public InterviewResponse toInterviewResponse(Interview interview) {
        if (interview == null) return null;
        return new InterviewResponse(
                interview.getId(),
                interview.getApplicationId(),
                interview.getInterviewType(),
                interview.getInterviewStage(),
                interview.getScheduledAt(),
                interview.getDurationMinutes(),
                interview.getLocation(),
                interview.getMeetingUrl(),
                interview.getInterviewerName(),
                interview.getInterviewerEmail(),
                interview.getPreparationNotes(),
                interview.getFeedback(),
                interview.getResult(),
                interview.getCreatedAt(),
                interview.getUpdatedAt()
        );
    }

    public ReminderResponse toReminderResponse(Reminder reminder) {
        if (reminder == null) return null;
        return new ReminderResponse(
                reminder.getId(),
                reminder.getApplicationId(),
                reminder.getTitle(),
                reminder.getDescription(),
                reminder.getReminderAt(),
                reminder.getStatus(),
                reminder.getCompletedAt(),
                reminder.getCreatedAt(),
                reminder.getUpdatedAt()
        );
    }

    public DocumentResponse toDocumentResponse(Document document) {
        if (document == null) return null;
        return new DocumentResponse(
                document.getId(),
                document.getApplicationId(),
                document.getOriginalFilename(),
                document.getContentType(),
                document.getFileSize(),
                document.getDocumentType(),
                document.getCreatedAt()
        );
    }
}

