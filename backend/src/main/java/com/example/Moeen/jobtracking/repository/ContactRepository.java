package com.example.Moeen.jobtracking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.contact.Contact;
import com.example.Moeen.jobtracking.domain.model.contact.ContactType;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    Optional<Contact> findByIdAndUserId(Long id, Long userId);

    List<Contact> findAllByUserId(Long userId, Sort sort);

    Page<Contact> findAllByUserId(Long userId, Pageable pageable);

    List<Contact> findAllByUserIdAndCompanyId(Long userId, Long companyId);

    List<Contact> findAllByUserIdAndContactType(Long userId, ContactType contactType);

    boolean existsByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}

