package com.example.Moeen.jobtracking.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.Moeen.jobtracking.domain.model.application.DocumentType;
import com.example.Moeen.jobtracking.dto.document.DocumentResponse;
import com.example.Moeen.jobtracking.service.DocumentService;

@RestController
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class DocumentController {

    private static final String USER_ID_HEADER = "X-User-Id";
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/api/v1/applications/{applicationId}/documents")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") DocumentType type) {
        DocumentResponse response = documentService.uploadDocument(userId, applicationId, file, type);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/v1/applications/{applicationId}/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long documentId) {

        Resource resource = documentService.downloadDocument(userId, applicationId, documentId);
        String filename = resource.getFilename() != null ? resource.getFilename() : "document";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @GetMapping("/api/v1/applications/{applicationId}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocumentsForApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId) {
        List<DocumentResponse> response = documentService.getDocumentsForApplication(userId, applicationId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/v1/applications/{applicationId}/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long documentId) {
        documentService.deleteDocument(userId, applicationId, documentId);
        return ResponseEntity.noContent().build();
    }
}
