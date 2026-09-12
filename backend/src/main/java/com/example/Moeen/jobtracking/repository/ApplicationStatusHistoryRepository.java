package com.example.Moeen.jobtracking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.application.ApplicationStatusHistory;

@Repository
public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {

    List<ApplicationStatusHistory> findAllByApplicationIdOrderByChangedAtDesc(Long applicationId);

    void deleteAllByApplicationId(Long applicationId);
}

