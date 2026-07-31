package com.example.Moeen.jobtracking.domain.model.contact;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ApplicationContactId implements Serializable {

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "contact_id", nullable = false)
    private Long contactId;
}
