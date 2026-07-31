package com.example.Moeen.jobtracking.domain.model.contact;

import com.example.Moeen.jobtracking.domain.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "application_contacts")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationContact extends BaseEntity {

    @EmbeddedId
    private ApplicationContactId id;

    @Column(name = "user_id", nullable = false)
    private Long userId;
}
