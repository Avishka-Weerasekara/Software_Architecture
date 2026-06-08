package com.traffic.service;

import com.traffic.dto.AuthRequest;
import com.traffic.dto.AuthResponse;
import com.traffic.dto.RegisterRequest;
import com.traffic.entity.CitizenUser;
import com.traffic.entity.PoliceUser;
import com.traffic.entity.Role;
import com.traffic.entity.User;
import com.traffic.repository.UserRepository;
import com.traffic.security.JwtUtil;
import com.traffic.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }

        User user;
        
        if (request.getRole() == Role.ADMIN) {
            user = PoliceUser.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.ADMIN)
                    .age(request.getAge())
                    .gender(request.getGender())
                    .policeId(request.getPoliceId())
                    .jobPosition(request.getJobPosition())
                    .workStation(request.getWorkStation())
                    .build();
        } else {
            user = CitizenUser.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.USER)
                    .age(request.getAge())
                    .gender(request.getGender())
                    .address(request.getAddress())
                    .province(request.getProvince())
                    .district(request.getDistrict())
                    .nic(request.getNic())
                    .telephone(request.getTelephone())
                    .build();
        }

        // JPA Polymorphism allows saving subclasses dynamically into their correct tables!
        userRepository.save(user);

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String jwtToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwtToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .role(userDetails.getRole().name())
                .email(userDetails.getEmail())
                .build();
    }
}
