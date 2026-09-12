package com.example.Moeen.jobtracking.dto.interview;

import com.example.Moeen.jobtracking.domain.model.application.InterviewResult;

public record UpdateInterviewResultRequest(
        InterviewResult result,
        String feedback
) {
}

