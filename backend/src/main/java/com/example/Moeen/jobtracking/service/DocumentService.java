package com.example.Moeen.jobtracking.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.Moeen.jobtracking.domain.model.application.Document;
import com.example.Moeen.jobtracking.domain.model.application.DocumentType;
import com.example.Moeen.jobtracking.dto.document.DocumentResponse;
import com.example.Moeen.jobtracking.exception.InvalidOperationException;
import com.example.Moeen.jobtracking.exception.ResourceNotFoundException;
import com.example.Moeen.jobtracking.repository.DocumentRepository;
import com.example.Moeen.jobtracking.repository.JobApplicationRepository;
import com.example.Moeen.jobtracking.service.mapper.JobTrackingMapper;

@Service
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobTrackingMapper mapper;
    private final Path storageLocation;

    public DocumentService(DocumentRepository documentRepository,
                           JobApplicationRepository jobApplicationRepository,
                           JobTrackingMapper mapper,
                           @Value("${app.document.upload-dir:uploads/documents}") String uploadDir) {
        this.documentRepository = documentRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.mapper = mapper;
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + this.storageLocation, e);
        }
    }

    @Transactional
    public DocumentResponse uploadDocument(Long userId, Long applicationId, MultipartFile file, DocumentType type) {
        verifyApplicationOwnership(userId, applicationId);

        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Uploaded file must not be empty.");
        }
        if (type == null) {
            throw new InvalidOperationException("Document type is required.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        if (originalFilename.contains("..")) {
            throw new InvalidOperationException("Filename contains invalid path sequence: " + originalFilename);
        }

        String storedFilename = UUID.randomUUID() + "_" + originalFilename;
        Path targetLocation = this.storageLocation.resolve(storedFilename).normalize();

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file: " + originalFilename, e);
        }

        Document document = new Document();
        document.setApplicationId(applicationId);
        document.setOriginalFilename(originalFilename);
        document.setStoredFilename(storedFilename);
        document.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        document.setFileSize(file.getSize());
        document.setStoragePath(targetLocation.toString());
        document.setDocumentType(type);

        Document saved = documentRepository.save(document);
        return mapper.toDocumentResponse(saved);
    }

    public Resource downloadDocument(Long userId, Long applicationId, Long documentId) {
        verifyApplicationOwnership(userId, applicationId);
        Document document = documentRepository.findByIdAndApplicationId(documentId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        Path filePath = Paths.get(document.getStoragePath()).normalize();
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on storage: " + document.getOriginalFilename());
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Malformed file path: " + document.getOriginalFilename());
        }
    }

    public List<DocumentResponse> getDocumentsForApplication(Long userId, Long applicationId) {
        verifyApplicationOwnership(userId, applicationId);
        return documentRepository.findAllByApplicationIdOrderByCreatedAtDesc(applicationId).stream()
                .map(mapper::toDocumentResponse)
                .toList();
    }

    @Transactional
    public void deleteDocument(Long userId, Long applicationId, Long documentId) {
        verifyApplicationOwnership(userId, applicationId);
        Document document = documentRepository.findByIdAndApplicationId(documentId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        Path filePath = Paths.get(document.getStoragePath()).normalize();
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Logged or handled gracefully if file is already missing
        }

        documentRepository.delete(document);
    }

    private void verifyApplicationOwnership(Long userId, Long applicationId) {
        if (!jobApplicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("Job application not found with id: " + applicationId);
        }
    }
}

