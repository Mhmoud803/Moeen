package com.example.Moeen.jobtracking.dto.dashboard;

import java.util.List;
import java.util.Map;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;
import com.example.Moeen.jobtracking.dto.application.JobApplicationSummaryResponse;
import com.example.Moeen.jobtracking.dto.interview.InterviewResponse;
import com.example.Moeen.jobtracking.dto.reminder.ReminderResponse;

public record JobTrackerDashboardResponse(
        long totalApplications,
        Map<ApplicationStatus, Long> statusCounts,
        List<JobApplicationSummaryResponse> upcomingFollowUps,
        List<InterviewResponse> upcomingInterviews,
        List<ReminderResponse> pendingReminders
) {
}

