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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationPriority;
import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;
import com.example.Moeen.jobtracking.dto.application.ApplicationStatusHistoryResponse;
import com.example.Moeen.jobtracking.dto.application.ChangeApplicationStatusRequest;
import com.example.Moeen.jobtracking.dto.application.CreateJobApplicationRequest;
import com.example.Moeen.jobtracking.dto.application.JobApplicationResponse;
import com.example.Moeen.jobtracking.dto.application.JobApplicationSummaryResponse;
import com.example.Moeen.jobtracking.dto.application.UpdateJobApplicationRequest;
import com.example.Moeen.jobtracking.service.JobApplicationService;

@RestController
@RequestMapping("/api/v1/applications")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class JobApplicationController {

    private static final String USER_ID_HEADER = "X-User-Id";
    private final JobApplicationService applicationService;

    public JobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> createApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @RequestBody CreateJobApplicationRequest request) {
        JobApplicationResponse response = applicationService.createApplication(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> updateApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id,
            @RequestBody UpdateJobApplicationRequest request) {
        JobApplicationResponse response = applicationService.updateApplication(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationResponse> changeStatus(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id,
            @RequestBody ChangeApplicationStatusRequest request) {
        JobApplicationResponse response = applicationService.changeStatus(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getApplicationById(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        JobApplicationResponse response = applicationService.getApplicationById(userId, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<JobApplicationSummaryResponse>> getApplications(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) ApplicationPriority priority) {
        List<JobApplicationSummaryResponse> response = applicationService.getApplications(userId, status, priority);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ApplicationStatusHistoryResponse>> getStatusHistory(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        List<ApplicationStatusHistoryResponse> response = applicationService.getStatusHistory(userId, id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        applicationService.deleteApplication(userId, id);
        return ResponseEntity.noContent().build();
    }
}
