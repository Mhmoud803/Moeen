package com.example.Moeen.jobtracking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.company.Company;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByIdAndUserId(Long id, Long userId);

    List<Company> findAllByUserIdOrderByNameAsc(Long userId);

    Page<Company> findAllByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);

    boolean existsByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
