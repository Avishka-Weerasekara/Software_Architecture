package com.traffic.dto;

import com.traffic.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private Role role;
    
    // Shared
    private Integer age;
    private String gender;

    // User Fields
    private String address;
    private String province;
    private String district;
    private String nic;
    private String telephone;

    // Police Fields
    private String policeId;
    private String jobPosition;
    private String workStation;
}
