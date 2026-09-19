package com.example.Moeen.jobtracking.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Moeen.jobtracking.domain.model.company.Company;
import com.example.Moeen.jobtracking.domain.model.contact.ApplicationContact;
import com.example.Moeen.jobtracking.domain.model.contact.ApplicationContactId;
import com.example.Moeen.jobtracking.domain.model.contact.Contact;
import com.example.Moeen.jobtracking.domain.model.contact.ContactType;
import com.example.Moeen.jobtracking.dto.contact.ContactResponse;
import com.example.Moeen.jobtracking.dto.contact.CreateContactRequest;
import com.example.Moeen.jobtracking.dto.contact.UpdateContactRequest;
import com.example.Moeen.jobtracking.exception.DuplicateResourceException;
import com.example.Moeen.jobtracking.exception.InvalidOperationException;
import com.example.Moeen.jobtracking.exception.ResourceNotFoundException;
import com.example.Moeen.jobtracking.repository.ApplicationContactRepository;
import com.example.Moeen.jobtracking.repository.CompanyRepository;
import com.example.Moeen.jobtracking.repository.ContactRepository;
import com.example.Moeen.jobtracking.repository.JobApplicationRepository;
import com.example.Moeen.jobtracking.service.mapper.JobTrackingMapper;

@Service
@Transactional(readOnly = true)
public class ContactService {

    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationContactRepository applicationContactRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobTrackingMapper mapper;

    public ContactService(ContactRepository contactRepository,
                          CompanyRepository companyRepository,
                          ApplicationContactRepository applicationContactRepository,
                          JobApplicationRepository jobApplicationRepository,
                          JobTrackingMapper mapper) {
        this.contactRepository = contactRepository;
        this.companyRepository = companyRepository;
        this.applicationContactRepository = applicationContactRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ContactResponse createContact(Long userId, CreateContactRequest request) {
        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new InvalidOperationException("Full name is required.");
        }
        if (request.contactType() == null) {
            throw new InvalidOperationException("Contact type is required.");
        }

        Company company = null;
        if (request.companyId() != null) {
            company = companyRepository.findByIdAndUserId(request.companyId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.companyId()));
        }

        Contact contact = new Contact();
        contact.setUserId(userId);
        contact.setCompanyId(request.companyId());
        contact.setFullName(request.fullName().trim());
        contact.setJobTitle(request.jobTitle());
        contact.setEmail(request.email());
        contact.setPhone(request.phone());
        contact.setLinkedinUrl(request.linkedinUrl());
        contact.setContactType(request.contactType());
        contact.setNotes(request.notes());

        Contact saved = contactRepository.save(contact);
        return mapper.toContactResponse(saved, company);
    }

    @Transactional
    public ContactResponse updateContact(Long userId, Long contactId, UpdateContactRequest request) {
        Contact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + contactId));

        Company company = null;
        if (request.companyId() != null) {
            company = companyRepository.findByIdAndUserId(request.companyId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.companyId()));
        }

        if (request.fullName() != null && !request.fullName().isBlank()) {
            contact.setFullName(request.fullName().trim());
        }
        if (request.contactType() != null) {
            contact.setContactType(request.contactType());
        }

        contact.setCompanyId(request.companyId());
        contact.setJobTitle(request.jobTitle());
        contact.setEmail(request.email());
        contact.setPhone(request.phone());
        contact.setLinkedinUrl(request.linkedinUrl());
        contact.setNotes(request.notes());

        Contact updated = contactRepository.save(contact);
        return mapper.toContactResponse(updated, company);
    }

    public ContactResponse getContactById(Long userId, Long contactId) {
        Contact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + contactId));
        Company company = contact.getCompanyId() != null
                ? companyRepository.findByIdAndUserId(contact.getCompanyId(), userId).orElse(null)
                : null;
        return mapper.toContactResponse(contact, company);
    }

    public List<ContactResponse> getContacts(Long userId, Long companyId, ContactType contactType) {
        List<Contact> contacts;
        if (companyId != null) {
            contacts = contactRepository.findAllByUserIdAndCompanyId(userId, companyId);
        } else if (contactType != null) {
            contacts = contactRepository.findAllByUserIdAndContactType(userId, contactType);
        } else {
            contacts = contactRepository.findAllByUserId(userId, Sort.by(Sort.Direction.ASC, "fullName"));
        }

        Map<Long, Company> companyMap = companyRepository.findAllByUserIdOrderByNameAsc(userId).stream()
                .collect(Collectors.toMap(Company::getId, c -> c));

        return contacts.stream()
                .map(c -> mapper.toContactResponse(c, c.getCompanyId() != null ? companyMap.get(c.getCompanyId()) : null))
                .toList();
    }

    @Transactional
    public void deleteContact(Long userId, Long contactId) {
        Contact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + contactId));
        contactRepository.delete(contact);
    }

    @Transactional
    public void linkContactToApplication(Long userId, Long applicationId, Long contactId) {
        if (!jobApplicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("Job application not found with id: " + applicationId);
        }
        if (!contactRepository.existsByIdAndUserId(contactId, userId)) {
            throw new ResourceNotFoundException("Contact not found with id: " + contactId);
        }

        if (applicationContactRepository.existsByIdApplicationIdAndIdContactId(applicationId, contactId)) {
            throw new DuplicateResourceException("Contact already linked to this application.");
        }

        ApplicationContact link = new ApplicationContact();
        link.setId(new ApplicationContactId(applicationId, contactId));
        link.setUserId(userId);
        applicationContactRepository.save(link);
    }

    @Transactional
    public void unlinkContactFromApplication(Long userId, Long applicationId, Long contactId) {
        if (!jobApplicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("Job application not found with id: " + applicationId);
        }
        applicationContactRepository.deleteByIdApplicationIdAndIdContactId(applicationId, contactId);
    }

    public List<ContactResponse> getContactsForApplication(Long userId, Long applicationId) {
        if (!jobApplicationRepository.existsByIdAndUserId(applicationId, userId)) {
            throw new ResourceNotFoundException("Job application not found with id: " + applicationId);
        }

        List<ApplicationContact> links = applicationContactRepository.findAllByUserIdAndIdApplicationId(userId, applicationId);
        List<Long> contactIds = links.stream().map(l -> l.getId().getContactId()).toList();

        Map<Long, Company> companyMap = companyRepository.findAllByUserIdOrderByNameAsc(userId).stream()
                .collect(Collectors.toMap(Company::getId, c -> c));

        return contactIds.stream()
                .map(id -> contactRepository.findByIdAndUserId(id, userId).orElse(null))
                .filter(Objects::nonNull)
                .map(c -> mapper.toContactResponse(c, c.getCompanyId() != null ? companyMap.get(c.getCompanyId()) : null))
                .toList();
    }
}

