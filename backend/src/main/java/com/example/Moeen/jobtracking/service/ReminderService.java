package com.example.Moeen.jobtracking.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Moeen.jobtracking.domain.model.application.Reminder;
import com.example.Moeen.jobtracking.domain.model.application.ReminderStatus;
import com.example.Moeen.jobtracking.dto.reminder.CreateReminderRequest;
import com.example.Moeen.jobtracking.dto.reminder.ReminderResponse;
import com.example.Moeen.jobtracking.dto.reminder.UpdateReminderRequest;
import com.example.Moeen.jobtracking.exception.InvalidOperationException;
import com.example.Moeen.jobtracking.exception.ResourceNotFoundException;
import com.example.Moeen.jobtracking.repository.JobApplicationRepository;
import com.example.Moeen.jobtracking.repository.ReminderRepository;
import com.example.Moeen.jobtracking.service.mapper.JobTrackingMapper;

@Service
@Transactional(readOnly = true)
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobTrackingMapper mapper;

    public ReminderService(ReminderRepository reminderRepository,
                           JobApplicationRepository jobApplicationRepository,
                           JobTrackingMapper mapper) {
        this.reminderRepository = reminderRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ReminderResponse createReminder(Long userId, Long applicationId, CreateReminderRequest request) {
        verifyApplicationOwnership(userId, applicationId);

        if (request.title() == null || request.title().isBlank()) {
            throw new InvalidOperationException("Reminder title is required.");
        }
        if (request.reminderAt() == null) {
            throw new InvalidOperationException("Reminder time is required.");
        }

        Reminder reminder = new Reminder();
        reminder.setApplicationId(applicationId);
        reminder.setTitle(request.title().trim());
        reminder.setDescription(request.description());
        reminder.setReminderAt(request.reminderAt());
        reminder.setStatus(ReminderStatus.PENDING);
        reminder.setCompletedAt(null);

        Reminder saved = reminderRepository.save(reminder);
        return mapper.toReminderResponse(saved);
    }

    @Transactional
    public ReminderResponse updateReminder(Long userId, Long applicationId, Long reminderId, UpdateReminderRequest request) {
        verifyApplicationOwnership(userId, applicationId);
        Reminder reminder = reminderRepository.findByIdAndApplicationId(reminderId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + reminderId));

        if (request.title() != null && !request.title().isBlank()) {
            reminder.setTitle(request.title().trim());
        }
        if (request.reminderAt() != null) {
            reminder.setReminderAt(request.reminderAt());
        }
        reminder.setDescription(request.description());

        if (request.status() != null) {
            reminder.setStatus(request.status());
            if (request.status() == ReminderStatus.COMPLETED) {
                reminder.setCompletedAt(Instant.now());
            } else {
                reminder.setCompletedAt(null);
            }
        }

        Reminder updated = reminderRepository.save(reminder);
        return mapper.toReminderResponse(updated);
    }

    @Transactional
    public ReminderResponse markCompleted(Long userId, Long applicationId, Long reminderId) {
        verifyApplicationOwnership(userId, applicationId);
        Reminder reminder = reminderRepository.findByIdAndApplicationId(reminderId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + reminderId));

        reminder.setStatus(ReminderStatus.COMPLETED);
        reminder.setCompletedAt(Instant.now());

        Reminder updated = reminderRepository.save(reminder);
        return mapper.toReminderResponse(updated);
    }

    public List<ReminderResponse> getRemindersForApplication(Long userId, Long applicationId) {
        verifyApplicationOwnership(userId, applicationId);
        return reminderRepository.findAllByApplicationIdOrderByReminderAtAsc(applicationId).stream()
                .map(mapper::toReminderResponse)
                .toList();
    }

    public List<ReminderResponse> getPendingReminders(Long userId) {
        return reminderRepository.findByUserIdAndStatus(userId, ReminderStatus.PENDING).stream()
                .map(mapper::toReminderResponse)
                .toList();
    }

    @Transactional
    public void deleteReminder(Long userId, Long applicationId, Long reminderId) {
        verifyApplicationOwnership(userId, applicationId);
        Reminder reminder = reminderRepository.findByIdAndApplicationId(reminderId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + reminderId));
        reminderRepository.delete(reminder);
    }

    private void verifyApplicationOwnership(Long userId, Long applicationId) {
        if (!jobApplicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("Job application not found with id: " + applicationId);
        }
    }
}

