package com.example.Moeen.jobtracking.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Moeen.jobtracking.domain.model.contact.ContactType;
import com.example.Moeen.jobtracking.dto.contact.ContactResponse;
import com.example.Moeen.jobtracking.dto.contact.CreateContactRequest;
import com.example.Moeen.jobtracking.dto.contact.UpdateContactRequest;
import com.example.Moeen.jobtracking.service.ContactService;

@RestController
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class ContactController {

    private static final String USER_ID_HEADER = "X-User-Id";
    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/api/v1/contacts")
    public ResponseEntity<ContactResponse> createContact(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @RequestBody CreateContactRequest request) {
        ContactResponse response = contactService.createContact(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/v1/contacts/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id,
            @RequestBody UpdateContactRequest request) {
        ContactResponse response = contactService.updateContact(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/contacts/{id}")
    public ResponseEntity<ContactResponse> getContactById(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        ContactResponse response = contactService.getContactById(userId, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/contacts")
    public ResponseEntity<List<ContactResponse>> getContacts(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) ContactType type) {
        List<ContactResponse> response = contactService.getContacts(userId, companyId, type);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/v1/contacts/{id}")
    public ResponseEntity<Void> deleteContact(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        contactService.deleteContact(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/applications/{applicationId}/contacts")
    public ResponseEntity<List<ContactResponse>> getContactsForApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId) {
        List<ContactResponse> response = contactService.getContactsForApplication(userId, applicationId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/v1/applications/{applicationId}/contacts/{contactId}")
    public ResponseEntity<Void> linkContactToApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long contactId) {
        contactService.linkContactToApplication(userId, applicationId, contactId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/v1/applications/{applicationId}/contacts/{contactId}")
    public ResponseEntity<Void> unlinkContactFromApplication(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long applicationId,
            @PathVariable Long contactId) {
        contactService.unlinkContactFromApplication(userId, applicationId, contactId);
        return ResponseEntity.noContent().build();
    }
}
