package com.traffic.controller;

import com.traffic.dto.UserProfileDto;
import com.traffic.entity.CitizenUser;
import com.traffic.entity.PoliceUser;
import com.traffic.entity.User;
import com.traffic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileDto.UserProfileDtoBuilder builder = UserProfileDto.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .age(user.getAge())
                .gender(user.getGender());
                
        if (user instanceof CitizenUser) {
            CitizenUser citizen = (CitizenUser) user;
            builder.address(citizen.getAddress())
                   .province(citizen.getProvince())
                   .district(citizen.getDistrict())
                   .nic(citizen.getNic())
                   .telephone(citizen.getTelephone());
        } else if (user instanceof PoliceUser) {
            PoliceUser police = (PoliceUser) user;
            builder.policeId(police.getPoliceId())
                   .jobPosition(police.getJobPosition())
                   .workStation(police.getWorkStation());
        }
        
        return ResponseEntity.ok(builder.build());
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestBody UserProfileDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getAge() != null) user.setAge(dto.getAge());
        if (dto.getGender() != null) user.setGender(dto.getGender());
        
        if (user instanceof CitizenUser) {
            CitizenUser citizen = (CitizenUser) user;
            if (dto.getAddress() != null) citizen.setAddress(dto.getAddress());
            if (dto.getProvince() != null) citizen.setProvince(dto.getProvince());
            if (dto.getDistrict() != null) citizen.setDistrict(dto.getDistrict());
            if (dto.getNic() != null) citizen.setNic(dto.getNic());
            if (dto.getTelephone() != null) citizen.setTelephone(dto.getTelephone());
        } else if (user instanceof PoliceUser) {
            PoliceUser police = (PoliceUser) user;
            if (dto.getJobPosition() != null) police.setJobPosition(dto.getJobPosition());
            if (dto.getWorkStation() != null) police.setWorkStation(dto.getWorkStation());
        }
        
        userRepository.save(user);
        return ResponseEntity.ok("Profile updated successfully");
    }
}
