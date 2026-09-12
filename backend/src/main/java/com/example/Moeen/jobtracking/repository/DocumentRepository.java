package com.example.Moeen.jobtracking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Moeen.jobtracking.domain.model.application.Document;
import com.example.Moeen.jobtracking.domain.model.application.DocumentType;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Optional<Document> findByIdAndApplicationId(Long id, Long applicationId);

    List<Document> findAllByApplicationIdOrderByCreatedAtDesc(Long applicationId);

    List<Document> findAllByApplicationIdAndDocumentType(Long applicationId, DocumentType documentType);

    void deleteAllByApplicationId(Long applicationId);
}

