package com.traffic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private String fullName;
    private String email;
    private Integer age;
    private String gender;
    
    // Citizen fields
    private String address;
    private String province;
    private String district;
    private String nic;
    private String telephone;
    
    // Police fields
    private String policeId;
    private String jobPosition;
    private String workStation;
}
