package com.example.Moeen.jobtracking.domain.model.opportunity;

import com.example.Moeen.jobtracking.domain.model.BaseEntity;
import com.example.Moeen.jobtracking.domain.model.shared.SalaryCurrency;
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

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "job_opportunities")
@Getter
@Setter
@NoArgsConstructor
public class JobOpportunity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "job_url", length = 1000)
    private String jobUrl;

    @Column(length = 100)
    private String source;

    @Column(length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "work_arrangement", columnDefinition = "work_arrangement")
    private WorkArrangement workArrangement;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "employment_type", columnDefinition = "employment_type")
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "experience_level", columnDefinition = "experience_level")
    private ExperienceLevel experienceLevel;

    @Column(name = "minimum_salary", precision = 12, scale = 2)
    private BigDecimal minimumSalary;

    @Column(name = "maximum_salary", precision = 12, scale = 2)
    private BigDecimal maximumSalary;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "salary_currency", columnDefinition = "salary_currency")
    private SalaryCurrency salaryCurrency;

    @Column(name = "posting_date")
    private LocalDate postingDate;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(nullable = false)
    private Boolean active = true;
}
