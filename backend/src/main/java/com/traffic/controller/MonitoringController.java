package com.traffic.controller;

import com.traffic.dto.MonitoringStatsDto;
import com.traffic.repository.FineRepository;
import com.traffic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/monitoring/stats")
@RequiredArgsConstructor
public class MonitoringController {

    private final UserRepository userRepository;
    private final FineRepository fineRepository;

    @GetMapping
    public MonitoringStatsDto getMonitoringStats() {

        return MonitoringStatsDto.builder()
                .totalUsers(userRepository.count())
                .totalFines(fineRepository.count())
                .paidFines(fineRepository.countByStatus("PAID"))
                .pendingFines(fineRepository.countByStatus("PENDING"))
                .revenue(fineRepository.getTotalRevenue())
                .build();
    }
}