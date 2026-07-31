package com.example.Moeen.jobtracking.domain.model.contact;

import com.example.Moeen.jobtracking.domain.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@NoArgsConstructor
public class Contact extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "job_title", length = 255)
    private String jobTitle;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "contact_type", nullable = false, columnDefinition = "contact_type")
    private ContactType contactType;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
