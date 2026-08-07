package com.example.Moeen.study;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class StudyService {
    private final StudySessionRepository sessionRepository;
    private final StudyPreferenceRepository preferenceRepository;

    public StudyService(StudySessionRepository sessionRepository,
                        StudyPreferenceRepository preferenceRepository) {
        this.sessionRepository = sessionRepository;
        this.preferenceRepository = preferenceRepository;
    }

    public List<StudySession> findSessions(String ownerKey, LocalDate from, LocalDate to) {
        return sessionRepository.findByOwnerKeyAndStudiedOnBetweenOrderByCompletedAtDesc(ownerKey, from, to);
    }

    @Transactional
    public StudySession addSession(String ownerKey, String subject, int durationMinutes,
                                   LocalDate studiedOn, StudySessionSource source) {
        StudySession session = new StudySession();
        session.setOwnerKey(ownerKey);
        session.setSubject(subject);
        session.setDurationMinutes(durationMinutes);
        session.setStudiedOn(studiedOn);
        session.setCompletedAt(Instant.now());
        session.setSource(source);
        return sessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(String ownerKey, Long sessionId) {
        StudySession session = sessionRepository.findByIdAndOwnerKey(sessionId, ownerKey)
                .orElseThrow(() -> new StudySessionNotFoundException(sessionId));
        sessionRepository.delete(session);
    }

    public StudyPreference getPreferences(String ownerKey) {
        return preferenceRepository.findById(ownerKey).orElseGet(() -> defaultPreferences(ownerKey));
    }

    @Transactional
    public StudyPreference savePreferences(String ownerKey, short focusMinutes, short shortBreakMinutes,
                                           short longBreakMinutes, short sessionsUntilLongBreak) {
        StudyPreference preference = preferenceRepository.findById(ownerKey)
                .orElseGet(() -> defaultPreferences(ownerKey));
        preference.setFocusMinutes(focusMinutes);
        preference.setShortBreakMinutes(shortBreakMinutes);
        preference.setLongBreakMinutes(longBreakMinutes);
        preference.setSessionsUntilLongBreak(sessionsUntilLongBreak);
        return preferenceRepository.save(preference);
    }

    private StudyPreference defaultPreferences(String ownerKey) {
        StudyPreference preference = new StudyPreference();
        preference.setOwnerKey(ownerKey);
        return preference;
    }

    static class StudySessionNotFoundException extends RuntimeException {
        StudySessionNotFoundException(Long id) {
            super("Study session " + id + " was not found");
        }
    }
}
