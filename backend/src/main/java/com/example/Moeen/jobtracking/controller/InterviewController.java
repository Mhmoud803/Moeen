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

import com.example.Moeen.jobtracking.dto.interview.InterviewResponse;
import com.example.Moeen.jobtracking.dto.interview.ScheduleInterviewRequest;
import com.example.Moeen.jobtracking.dto.interview.UpdateInterviewRequest;
import com.example.Moeen.jobtracking.dto.interview.UpdateInterviewResultRequest;
import com.example.Moeen.jobtracking.service.InterviewService;

@RestController
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class InterviewController {

    private static final String USER_ID_HEADER = "X-User-Id";
    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/api/v1/applications/{applicationId}/interviews")
    public ResponseEntity<InterviewResponse> scheduleInterview(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @RequestBody ScheduleInterviewRequest request) {
        InterviewResponse response = interviewService.scheduleInterview(userId, applicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/v1/applications/{applicationId}/interviews/{interviewId}")
    public ResponseEntity<InterviewResponse> updateInterview(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            @RequestBody UpdateInterviewRequest request) {
        InterviewResponse response = interviewService.updateInterview(userId, applicationId, interviewId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/v1/applications/{applicationId}/interviews/{interviewId}/result")
    public ResponseEntity<InterviewResponse> recordResult(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            @RequestBody UpdateInterviewResultRequest request) {
        InterviewResponse response = interviewService.recordResult(userId, applicationId, interviewId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/applications/{applicationId}/interviews")
    public ResponseEntity<List<InterviewResponse>> getInterviewsForApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId) {
        List<InterviewResponse> response = interviewService.getInterviewsForApplication(userId, applicationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/interviews/upcoming")
    public ResponseEntity<List<InterviewResponse>> getUpcomingInterviews(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId) {
        List<InterviewResponse> response = interviewService.getUpcomingInterviews(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/v1/applications/{applicationId}/interviews/{interviewId}")
    public ResponseEntity<Void> deleteInterview(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long interviewId) {
        interviewService.deleteInterview(userId, applicationId, interviewId);
        return ResponseEntity.noContent().build();
    }
}
