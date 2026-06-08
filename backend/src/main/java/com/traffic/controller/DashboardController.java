package com.traffic.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Admin Dashboard",
                "totalUsers", 150,
                "totalPayments", 54300,
                "recentActivities", "5 new users registered today"
        ));
    }

    @GetMapping("/user/dashboard")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to User Dashboard",
                "paymentHistory", "No recent payments",
                "outstandingFines", 0
        ));
    }
}
