package com.example.Moeen.jobtracking.domain.model.application;

import com.example.Moeen.jobtracking.domain.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.time.Instant;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
public class Interview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "interview_type", nullable = false, columnDefinition = "interview_type")
    private InterviewType interviewType;

    @Column(name = "interview_stage", length = 100)
    private String interviewStage;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(length = 500)
    private String location;

    @Column(name = "meeting_url", length = 1000)
    private String meetingUrl;

    @Column(name = "interviewer_name", length = 255)
    private String interviewerName;

    @Column(name = "interviewer_email", length = 255)
    private String interviewerEmail;

    @Column(name = "preparation_notes", columnDefinition = "TEXT")
    private String preparationNotes;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "interview_result")
    private InterviewResult result = InterviewResult.SCHEDULED;
}
