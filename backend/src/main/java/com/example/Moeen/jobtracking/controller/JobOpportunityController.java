package com.example.Moeen.jobtracking.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Moeen.jobtracking.dto.opportunity.CreateJobOpportunityRequest;
import com.example.Moeen.jobtracking.dto.opportunity.JobOpportunityResponse;
import com.example.Moeen.jobtracking.dto.opportunity.UpdateJobOpportunityRequest;
import com.example.Moeen.jobtracking.service.JobOpportunityService;

@RestController
@RequestMapping("/api/v1/opportunities")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class JobOpportunityController {

    private static final String USER_ID_HEADER = "X-User-Id";
    private final JobOpportunityService opportunityService;

    public JobOpportunityController(JobOpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @PostMapping
    public ResponseEntity<JobOpportunityResponse> createOpportunity(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @RequestBody CreateJobOpportunityRequest request) {
        JobOpportunityResponse response = opportunityService.createOpportunity(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOpportunityResponse> updateOpportunity(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id,
            @RequestBody UpdateJobOpportunityRequest request) {
        JobOpportunityResponse response = opportunityService.updateOpportunity(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOpportunityResponse> getOpportunityById(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        JobOpportunityResponse response = opportunityService.getOpportunityById(userId, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<JobOpportunityResponse>> getOpportunities(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        Page<JobOpportunityResponse> response = opportunityService.getOpportunities(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpportunity(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        opportunityService.deleteOpportunity(userId, id);
        return ResponseEntity.noContent().build();
    }
}
