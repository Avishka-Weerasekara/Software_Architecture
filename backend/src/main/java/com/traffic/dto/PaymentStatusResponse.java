package com.traffic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusResponse {
    private String paymentId;
    private String fineId;
    private String status;
    private Double amount;
    private String currency;
    private LocalDateTime transactionDate;
    private String receiptUrl;
    private String paymentMethod;
}
