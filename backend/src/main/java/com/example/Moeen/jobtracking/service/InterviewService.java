package com.example.Moeen.jobtracking.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Moeen.jobtracking.domain.model.application.Interview;
import com.example.Moeen.jobtracking.domain.model.application.InterviewResult;
import com.example.Moeen.jobtracking.dto.interview.InterviewResponse;
import com.example.Moeen.jobtracking.dto.interview.ScheduleInterviewRequest;
import com.example.Moeen.jobtracking.dto.interview.UpdateInterviewRequest;
import com.example.Moeen.jobtracking.dto.interview.UpdateInterviewResultRequest;
import com.example.Moeen.jobtracking.exception.InvalidOperationException;
import com.example.Moeen.jobtracking.exception.ResourceNotFoundException;
import com.example.Moeen.jobtracking.repository.InterviewRepository;
import com.example.Moeen.jobtracking.repository.JobApplicationRepository;
import com.example.Moeen.jobtracking.service.mapper.JobTrackingMapper;

@Service
@Transactional(readOnly = true)
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobTrackingMapper mapper;

    public InterviewService(InterviewRepository interviewRepository,
                            JobApplicationRepository jobApplicationRepository,
                            JobTrackingMapper mapper) {
        this.interviewRepository = interviewRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.mapper = mapper;
    }

    @Transactional
    public InterviewResponse scheduleInterview(Long userId, Long applicationId, ScheduleInterviewRequest request) {
        verifyApplicationOwnership(userId, applicationId);

        if (request.interviewType() == null) {
            throw new InvalidOperationException("Interview type is required.");
        }
        if (request.scheduledAt() == null) {
            throw new InvalidOperationException("Scheduled date/time is required.");
        }
        validateDuration(request.durationMinutes());

        Interview interview = new Interview();
        interview.setApplicationId(applicationId);
        interview.setInterviewType(request.interviewType());
        interview.setInterviewStage(request.interviewStage());
        interview.setScheduledAt(request.scheduledAt());
        interview.setDurationMinutes(request.durationMinutes());
        interview.setLocation(request.location());
        interview.setMeetingUrl(request.meetingUrl());
        interview.setInterviewerName(request.interviewerName());
        interview.setInterviewerEmail(request.interviewerEmail());
        interview.setPreparationNotes(request.preparationNotes());
        interview.setResult(InterviewResult.SCHEDULED);

        Interview saved = interviewRepository.save(interview);
        return mapper.toInterviewResponse(saved);
    }

    @Transactional
    public InterviewResponse updateInterview(Long userId, Long applicationId, Long interviewId, UpdateInterviewRequest request) {
        verifyApplicationOwnership(userId, applicationId);
        Interview interview = interviewRepository.findByIdAndApplicationId(interviewId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        validateDuration(request.durationMinutes());

        if (request.interviewType() != null) {
            interview.setInterviewType(request.interviewType());
        }
        if (request.scheduledAt() != null) {
            interview.setScheduledAt(request.scheduledAt());
        }
        interview.setInterviewStage(request.interviewStage());
        interview.setDurationMinutes(request.durationMinutes());
        interview.setLocation(request.location());
        interview.setMeetingUrl(request.meetingUrl());
        interview.setInterviewerName(request.interviewerName());
        interview.setInterviewerEmail(request.interviewerEmail());
        interview.setPreparationNotes(request.preparationNotes());
        interview.setFeedback(request.feedback());
        if (request.result() != null) {
            interview.setResult(request.result());
        }

        Interview updated = interviewRepository.save(interview);
        return mapper.toInterviewResponse(updated);
    }

    @Transactional
    public InterviewResponse recordResult(Long userId, Long applicationId, Long interviewId, UpdateInterviewResultRequest request) {
        verifyApplicationOwnership(userId, applicationId);
        Interview interview = interviewRepository.findByIdAndApplicationId(interviewId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        if (request.result() == null) {
            throw new InvalidOperationException("Interview result must be specified.");
        }

        interview.setResult(request.result());
        if (request.feedback() != null) {
            interview.setFeedback(request.feedback());
        }

        Interview updated = interviewRepository.save(interview);
        return mapper.toInterviewResponse(updated);
    }

    public List<InterviewResponse> getInterviewsForApplication(Long userId, Long applicationId) {
        verifyApplicationOwnership(userId, applicationId);
        return interviewRepository.findAllByApplicationIdOrderByScheduledAtAsc(applicationId).stream()
                .map(mapper::toInterviewResponse)
                .toList();
    }

    public List<InterviewResponse> getUpcomingInterviews(Long userId) {
        return interviewRepository.findUpcomingByUserId(userId, Instant.now(), InterviewResult.SCHEDULED).stream()
                .map(mapper::toInterviewResponse)
                .toList();
    }

    @Transactional
    public void deleteInterview(Long userId, Long applicationId, Long interviewId) {
        verifyApplicationOwnership(userId, applicationId);
        Interview interview = interviewRepository.findByIdAndApplicationId(interviewId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));
        interviewRepository.delete(interview);
    }

    private void verifyApplicationOwnership(Long userId, Long applicationId) {
        if (!jobApplicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("Job application not found with id: " + applicationId);
        }
    }

    private void validateDuration(Integer durationMinutes) {
        if (durationMinutes != null && durationMinutes <= 0) {
            throw new InvalidOperationException("Duration minutes must be positive.");
        }
    }
}

