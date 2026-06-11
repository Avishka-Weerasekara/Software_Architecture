package com.traffic.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MonitoringStatsDto {

    private long totalUsers;

    private long totalFines;

    private long paidFines;

    private long pendingFines;

    private double revenue;
}