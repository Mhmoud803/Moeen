package com.example.Moeen.study;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/study")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class StudyController {
    private static final String OWNER_HEADER = "X-Moeen-Owner";
    private final StudyService studyService;

    public StudyController(StudyService studyService) {
        this.studyService = studyService;
    }

    @GetMapping("/sessions")
    public List<StudySessionResponse> sessions(
            @RequestHeader(OWNER_HEADER) String ownerKey,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        validateOwner(ownerKey);
        if (from.isAfter(to) || from.isBefore(LocalDate.now().minusYears(5))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid study date range");
        }
        return studyService.findSessions(ownerKey, from, to).stream()
                .map(StudySessionResponse::from)
                .toList();
    }

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public StudySessionResponse addSession(@RequestHeader(OWNER_HEADER) String ownerKey,
                                           @RequestBody CreateStudySessionRequest request) {
        validateOwner(ownerKey);
        String subject = request.subject() == null || request.subject().isBlank()
                ? "Focus session" : request.subject().trim();
        if (subject.length() > 120 || request.durationMinutes() < 1 || request.durationMinutes() > 1440) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid study session");
        }
        LocalDate studiedOn = request.studiedOn() == null ? LocalDate.now() : request.studiedOn();
        StudySessionSource source = request.source() == null ? StudySessionSource.MANUAL : request.source();
        return StudySessionResponse.from(
                studyService.addSession(ownerKey, subject, request.durationMinutes(), studiedOn, source));
    }

    @DeleteMapping("/sessions/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSession(@RequestHeader(OWNER_HEADER) String ownerKey, @PathVariable Long sessionId) {
        validateOwner(ownerKey);
        studyService.deleteSession(ownerKey, sessionId);
    }

    @GetMapping("/preferences")
    public StudyPreferenceResponse preferences(@RequestHeader(OWNER_HEADER) String ownerKey) {
        validateOwner(ownerKey);
        return StudyPreferenceResponse.from(studyService.getPreferences(ownerKey));
    }

    @PutMapping("/preferences")
    public StudyPreferenceResponse savePreferences(@RequestHeader(OWNER_HEADER) String ownerKey,
                                                   @RequestBody StudyPreferenceRequest request) {
        validateOwner(ownerKey);
        if (request.focusMinutes() < 1 || request.focusMinutes() > 180
                || request.shortBreakMinutes() < 1 || request.shortBreakMinutes() > 60
                || request.longBreakMinutes() < 1 || request.longBreakMinutes() > 90
                || request.sessionsUntilLongBreak() < 1 || request.sessionsUntilLongBreak() > 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid timer preferences");
        }
        return StudyPreferenceResponse.from(studyService.savePreferences(ownerKey,
                request.focusMinutes(), request.shortBreakMinutes(), request.longBreakMinutes(),
                request.sessionsUntilLongBreak()));
    }

    @ExceptionHandler(StudyService.StudySessionNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleNotFound() {
    }

    private void validateOwner(String ownerKey) {
        if (ownerKey == null || !ownerKey.matches("[A-Za-z0-9-]{16,64}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid owner key");
        }
    }

    public record CreateStudySessionRequest(
            String subject,
            int durationMinutes,
            LocalDate studiedOn,
            StudySessionSource source) {
    }

    public record StudySessionResponse(
            Long id,
            String subject,
            int durationMinutes,
            LocalDate studiedOn,
            Instant completedAt,
            StudySessionSource source) {
        static StudySessionResponse from(StudySession session) {
            return new StudySessionResponse(session.getId(), session.getSubject(), session.getDurationMinutes(),
                    session.getStudiedOn(), session.getCompletedAt(), session.getSource());
        }
    }

    public record StudyPreferenceRequest(
            short focusMinutes,
            short shortBreakMinutes,
            short longBreakMinutes,
            short sessionsUntilLongBreak) {
    }

    public record StudyPreferenceResponse(
            short focusMinutes,
            short shortBreakMinutes,
            short longBreakMinutes,
            short sessionsUntilLongBreak) {
        static StudyPreferenceResponse from(StudyPreference preference) {
            return new StudyPreferenceResponse(preference.getFocusMinutes(), preference.getShortBreakMinutes(),
                    preference.getLongBreakMinutes(), preference.getSessionsUntilLongBreak());
        }
    }
}
