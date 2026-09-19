package com.example.Moeen.jobtracking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Moeen.jobtracking.dto.dashboard.JobTrackerDashboardResponse;
import com.example.Moeen.jobtracking.service.JobTrackerDashboardService;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class JobTrackerDashboardController {

    private static final String USER_ID_HEADER = "X-User-Id";
    private final JobTrackerDashboardService dashboardService;

    public JobTrackerDashboardController(JobTrackerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<JobTrackerDashboardResponse> getDashboardSummary(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId) {
        JobTrackerDashboardResponse response = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(response);
    }
}
