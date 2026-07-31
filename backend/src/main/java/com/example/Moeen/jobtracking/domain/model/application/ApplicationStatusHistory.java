package com.example.Moeen.jobtracking.domain.model.application;

import java.time.Instant;

import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

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

@Entity
@Table(name = "application_status_history")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationStatusHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "previous_status", columnDefinition = "application_status")
    private ApplicationStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "new_status", nullable = false, columnDefinition = "application_status")
    private ApplicationStatus newStatus;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;
}
