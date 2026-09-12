package com.example.Moeen.jobtracking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.contact.ApplicationContact;
import com.example.Moeen.jobtracking.domain.model.contact.ApplicationContactId;

@Repository
public interface ApplicationContactRepository extends JpaRepository<ApplicationContact, ApplicationContactId> {

    List<ApplicationContact> findAllByIdApplicationId(Long applicationId);

    List<ApplicationContact> findAllByUserIdAndIdApplicationId(Long userId, Long applicationId);

    boolean existsByIdApplicationIdAndIdContactId(Long applicationId, Long contactId);

    void deleteByIdApplicationIdAndIdContactId(Long applicationId, Long contactId);

    void deleteAllByIdApplicationId(Long applicationId);
}

