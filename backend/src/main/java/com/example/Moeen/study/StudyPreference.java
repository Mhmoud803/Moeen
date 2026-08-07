package com.example.Moeen.study;

import com.example.Moeen.jobtracking.domain.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "study_preferences")
@Getter
@Setter
@NoArgsConstructor
public class StudyPreference extends BaseEntity {

    @Id
    @Column(name = "owner_key", nullable = false, length = 64)
    private String ownerKey;

    @Column(name = "focus_minutes", nullable = false)
    private Short focusMinutes = 25;

    @Column(name = "short_break_minutes", nullable = false)
    private Short shortBreakMinutes = 5;

    @Column(name = "long_break_minutes", nullable = false)
    private Short longBreakMinutes = 15;

    @Column(name = "sessions_until_long_break", nullable = false)
    private Short sessionsUntilLongBreak = 4;
}
