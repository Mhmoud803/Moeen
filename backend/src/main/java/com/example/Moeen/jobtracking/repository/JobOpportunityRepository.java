package com.example.Moeen.jobtracking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.opportunity.JobOpportunity;

@Repository
public interface JobOpportunityRepository extends JpaRepository<JobOpportunity, Long> {

    Optional<JobOpportunity> findByIdAndUserId(Long id, Long userId);

    List<JobOpportunity> findAllByUserId(Long userId);

    Page<JobOpportunity> findAllByUserId(Long userId, Pageable pageable);

    List<JobOpportunity> findAllByUserIdAndActiveTrue(Long userId);

    List<JobOpportunity> findAllByUserIdAndCompanyId(Long userId, Long companyId);

    boolean existsByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}

