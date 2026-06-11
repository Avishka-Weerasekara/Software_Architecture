package com.traffic.controller;

import com.traffic.repository.FineRepository;
import com.traffic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final FineRepository fineRepository;

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminDashboard() {

        long totalUsers = userRepository.count();

        long totalFines = fineRepository.count();

        long paidFines = fineRepository.countByStatus("PAID");

        long pendingFines = fineRepository.countByStatus("PENDING");

        Double totalRevenue = fineRepository.getTotalRevenue();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalFines", totalFines,
                "paidFines", paidFines,
                "pendingFines", pendingFines,
                "totalRevenue", totalRevenue
        ));
    }

    @GetMapping("/user/dashboard")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserDashboard() {
        return ResponseEntity.ok(Map.of(
                "paymentHistory", "No recent payments",
                "outstandingFines", 0
        ));
    }
}