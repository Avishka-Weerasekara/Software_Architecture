package com.traffic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateResponse {
    private String paymentId; // Payment entity UUID
    private String checkoutSessionUrl; // Stripe redirect URL
    private String sessionId; // Stripe session ID
}
