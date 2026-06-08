package com.traffic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "fines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reference_number", unique = true, nullable = false)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private CitizenUser citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "police_id", nullable = false)
    private PoliceUser policeOfficer;

    @Column(name = "fine_date")
    private String fineDate;
    
    @Column(name = "fine_time")
    private String fineTime;
    
    private String location;

    @ElementCollection
    @CollectionTable(name = "fine_reasons", joinColumns = @JoinColumn(name = "fine_id"))
    private List<FineReason> reasons;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(nullable = false)
    private String status; // "PENDING", "PAID"
    
    @Column(name = "bank_name")
    private String bankName;
    
    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
