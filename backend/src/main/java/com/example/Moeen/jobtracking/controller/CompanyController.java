package com.example.Moeen.jobtracking.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Moeen.jobtracking.dto.company.CompanyResponse;
import com.example.Moeen.jobtracking.dto.company.CompanySummaryResponse;
import com.example.Moeen.jobtracking.dto.company.CreateCompanyRequest;
import com.example.Moeen.jobtracking.dto.company.UpdateCompanyRequest;
import com.example.Moeen.jobtracking.service.CompanyService;

@RestController
@RequestMapping("/api/v1/companies")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class CompanyController {

    private static final String USER_ID_HEADER = "X-User-Id";
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> createCompany(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @RequestBody CreateCompanyRequest request) {
        CompanyResponse response = companyService.createCompany(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> updateCompany(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id,
            @RequestBody UpdateCompanyRequest request) {
        CompanyResponse response = companyService.updateCompany(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        CompanyResponse response = companyService.getCompanyById(userId, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<CompanyResponse>> getCompanies(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String[] sort) {

        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        Page<CompanyResponse> response = companyService.getCompanies(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summaries")
    public ResponseEntity<List<CompanySummaryResponse>> getCompanySummaries(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId) {
        List<CompanySummaryResponse> response = companyService.getCompanySummaries(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(
            @RequestHeader(value = USER_ID_HEADER, defaultValue = "1") Long userId,
            @PathVariable Long id) {
        companyService.deleteCompany(userId, id);
        return ResponseEntity.noContent().build();
    }
}
