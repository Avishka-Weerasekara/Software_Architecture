package com.traffic.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "police_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PoliceUser extends User {
    @Column(name = "police_id")
    private String policeId;
    
    @Column(name = "job_position")
    private String jobPosition;
    
    @Column(name = "work_station")
    private String workStation;
}
