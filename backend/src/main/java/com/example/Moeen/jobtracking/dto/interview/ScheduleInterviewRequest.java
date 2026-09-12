package com.example.Moeen.jobtracking.dto.interview;

import java.time.Instant;

import com.example.Moeen.jobtracking.domain.model.application.InterviewType;

public record ScheduleInterviewRequest(
        InterviewType interviewType,
        String interviewStage,
        Instant scheduledAt,
        Integer durationMinutes,
        String location,
        String meetingUrl,
        String interviewerName,
        String interviewerEmail,
        String preparationNotes
) {
}

