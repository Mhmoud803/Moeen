package com.example.Moeen.jobtracking.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatus;
import com.example.Moeen.jobtracking.domain.model.application.JobApplication;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    Optional<JobApplication> findByJobOpportunityId(Long jobOpportunityId);

    boolean existsByJobOpportunityId(Long jobOpportunityId);

    boolean existsByIdAndUserId(Long id, Long userId);

    List<JobApplication> findAllByUserId(Long userId);

    Page<JobApplication> findAllByUserId(Long userId, Pageable pageable);

    List<JobApplication> findAllByUserIdAndCurrentStatus(Long userId, ApplicationStatus currentStatus);

    long countByUserIdAndCurrentStatus(Long userId, ApplicationStatus currentStatus);

    long countByUserId(Long userId);

    List<JobApplication> findAllByUserIdAndFollowUpAtBetween(Long userId, Instant start, Instant end);

    void deleteByIdAndUserId(Long id, Long userId);
}

