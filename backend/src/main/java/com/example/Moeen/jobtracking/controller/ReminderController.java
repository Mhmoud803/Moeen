package com.example.Moeen.jobtracking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.example.Moeen.jobtracking.dto.reminder.CreateReminderRequest;
import com.example.Moeen.jobtracking.dto.reminder.ReminderResponse;
import com.example.Moeen.jobtracking.dto.reminder.UpdateReminderRequest;
import com.example.Moeen.jobtracking.service.ReminderService;

@RestController
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class ReminderController {

    private static final String USER_ID_HEADER = "X-User-Id";
    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping("/api/v1/applications/{applicationId}/reminders")
    public ResponseEntity<ReminderResponse> createReminder(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @RequestBody CreateReminderRequest request) {
        ReminderResponse response = reminderService.createReminder(userId, applicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/v1/applications/{applicationId}/reminders/{reminderId}")
    public ResponseEntity<ReminderResponse> updateReminder(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long reminderId,
            @RequestBody UpdateReminderRequest request) {
        ReminderResponse response = reminderService.updateReminder(userId, applicationId, reminderId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/v1/applications/{applicationId}/reminders/{reminderId}/complete")
    public ResponseEntity<ReminderResponse> markCompleted(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long reminderId) {
        ReminderResponse response = reminderService.markCompleted(userId, applicationId, reminderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/applications/{applicationId}/reminders")
    public ResponseEntity<List<ReminderResponse>> getRemindersForApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId) {
        List<ReminderResponse> response = reminderService.getRemindersForApplication(userId, applicationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/reminders/pending")
    public ResponseEntity<List<ReminderResponse>> getPendingReminders(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId) {
        List<ReminderResponse> response = reminderService.getPendingReminders(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/v1/applications/{applicationId}/reminders/{reminderId}")
    public ResponseEntity<Void> deleteReminder(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long reminderId) {
        reminderService.deleteReminder(userId, applicationId, reminderId);
        return ResponseEntity.noContent().build();
    }
}
