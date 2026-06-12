package com.traffic.service;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.traffic.dto.PaymentInitiateRequest;
import com.traffic.dto.PaymentInitiateResponse;
import com.traffic.dto.PaymentStatusResponse;
import com.traffic.entity.CitizenUser;
import com.traffic.entity.Fine;
import com.traffic.entity.Payment;
import com.traffic.repository.FineRepository;
import com.traffic.repository.PaymentRepository;
import com.traffic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.stripe.model.PaymentIntent;
import com.stripe.exception.StripeException;
import com.stripe.net.ApiResource;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final FineRepository fineRepository;
    private final UserRepository userRepository;
    private final SmsService smsService;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    /**
     * Initiate a payment for a fine using Stripe Checkout
     */
    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, UUID userId) throws StripeException {
        // Fetch fine
        UUID fineId = UUID.fromString(request.getFineId());
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        // Verify fine is PENDING
        if (!"PENDING".equals(fine.getStatus())) {
            throw new RuntimeException("Fine is already " + fine.getStatus() + ". Cannot process payment.");
        }

        // Fetch user (citizen)
        CitizenUser citizen = (CitizenUser) userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create Stripe Checkout Session
        Session stripeSession = createStripeCheckoutSession(fine, citizen, request);

        // Create Payment entity
        Payment payment = Payment.builder()
                .fine(fine)
                .citizen(citizen)
                .stripeSessionId(stripeSession.getId())
                .amount(fine.getTotalAmount())
                .currency("LKR")
                .status("PENDING")
                .createdAt(java.time.LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);
        // Link the payment to the fine for quick lookup
        Fine fineToUpdate = payment.getFine();
        fineToUpdate.setLastPaymentId(payment.getId());
        fineRepository.save(fineToUpdate);

        return PaymentInitiateResponse.builder()
            .paymentId(payment.getId().toString())
            .checkoutSessionUrl(stripeSession.getUrl())
            .sessionId(stripeSession.getId())
            .build();
    }

    /**
     * Create Stripe Checkout Session
     */
    private Session createStripeCheckoutSession(Fine fine, CitizenUser citizen, PaymentInitiateRequest request) throws StripeException {
        String returnUrl = request.getReturnUrl();
        String successRedirect = successUrl;
        String cancelRedirect = cancelUrl;

        if (returnUrl != null && !returnUrl.isBlank()) {
            String baseUrl = returnUrl.replaceAll("/+$", "");
            successRedirect = baseUrl + "/payment-success?sessionId={CHECKOUT_SESSION_ID}";
            cancelRedirect = baseUrl + "/payment-cancelled";
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successRedirect)
                .setCancelUrl(cancelRedirect)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setClientReferenceId(fine.getId().toString())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("lkr")
                                                .setUnitAmount((long) (fine.getTotalAmount() * 100)) // Stripe expects cents
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Traffic Fine Payment")
                                                                .setDescription("Payment for fine " + fine.getReferenceNumber())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .setCustomerEmail(citizen.getEmail())
                .build();

        return Session.create(params);
    }

    /**
     * Handle successful payment from Stripe webhook
     */
    @Transactional
    public void handlePaymentSuccess(String sessionId, String paymentIntentId) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Payment not found for session: " + sessionId));

        // Prevent duplicate processing
        if ("SUCCESS".equals(payment.getStatus())) {
            log.warn("Payment {} already marked as SUCCESS. Ignoring duplicate webhook.", sessionId);
            return;
        }

        // Update Payment status
        payment.setStatus("SUCCESS");
        payment.setStripePaymentIntentId(paymentIntentId);
        payment.setUpdatedAt(java.time.LocalDateTime.now());
        paymentRepository.save(payment);

        // Update Fine status to PAID
        Fine fine = payment.getFine();
        fine.setStatus("PAID");
        // Ensure lastPaymentId points to this successful payment
        fine.setLastPaymentId(payment.getId());
        fineRepository.save(fine);

        // Send SMS confirmation
        try {
            CitizenUser citizen = payment.getCitizen();
            smsService.sendPaymentConfirmation(
                    citizen.getTelephone(),
                    payment.getAmount(),
                    fine.getReferenceNumber(),
                    payment.getId().toString()
            );
        } catch (Exception e) {
            log.error("Failed to send payment confirmation SMS: {}", e.getMessage());
            // Don't fail the payment if SMS fails
        }

        log.info("Payment {} processed successfully. Fine {} marked as PAID.", sessionId, fine.getId());
    }

    /**
     * Handle failed payment from Stripe webhook
     */
    @Transactional
    public void handlePaymentFailure(String sessionId) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Payment not found for session: " + sessionId));

        payment.setStatus("FAILED");
        payment.setUpdatedAt(java.time.LocalDateTime.now());
        paymentRepository.save(payment);

        log.info("Payment {} marked as FAILED.", sessionId);
    }

    /**
     * Process refund (admin-only)
     */
    @Transactional
    public void processRefund(UUID paymentId, String refundReason) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!"SUCCESS".equals(payment.getStatus())) {
            throw new RuntimeException("Only successful payments can be refunded.");
        }

        // Refund via Stripe
        com.stripe.model.Refund refund = com.stripe.model.Refund.create(
                new java.util.HashMap<String, Object>() {{
                    put("payment_intent", payment.getStripePaymentIntentId());
                }}
        );

        // Update Payment status
        payment.setStatus("REFUNDED");
        payment.setRefundId(refund.getId());
        payment.setRefundReason(refundReason);
        payment.setUpdatedAt(java.time.LocalDateTime.now());
        paymentRepository.save(payment);

        // Revert Fine status to PENDING
        Fine fine = payment.getFine();
        fine.setStatus("PENDING");
        // Clear last payment reference so UI shows no active payment
        fine.setLastPaymentId(null);
        fineRepository.save(fine);

        // Send SMS notification
        try {
            CitizenUser citizen = payment.getCitizen();
            smsService.sendRefundNotification(
                    citizen.getTelephone(),
                    payment.getAmount(),
                    payment.getId().toString()
            );
        } catch (Exception e) {
            log.error("Failed to send refund notification SMS: {}", e.getMessage());
        }

        log.info("Refund {} processed for payment {}. Fine {} reverted to PENDING.", refund.getId(), paymentId, fine.getId());
    }

    /**
     * Get payment status
     */
    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        return PaymentStatusResponse.builder()
                .paymentId(payment.getId().toString())
                .fineId(payment.getFine().getId().toString())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .transactionDate(payment.getUpdatedAt())
                .receiptUrl(payment.getReceiptUrl())
                .paymentMethod(payment.getPaymentMethod())
                .build();
    }

        @Transactional(readOnly = true)
        public PaymentStatusResponse getPaymentStatusBySession(String sessionId) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Payment not found for session: " + sessionId));

        return PaymentStatusResponse.builder()
            .paymentId(payment.getId().toString())
            .fineId(payment.getFine().getId().toString())
            .status(payment.getStatus())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .transactionDate(payment.getUpdatedAt())
            .receiptUrl(payment.getReceiptUrl())
            .paymentMethod(payment.getPaymentMethod())
            .build();
        }

    /**
     * Get total revenue (paid payments)
     */
    @Transactional(readOnly = true)
    public Double getTotalRevenue() {
        return paymentRepository.findByStatusOrderByCreatedAtDesc("SUCCESS")
                .stream()
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    @Transactional
    public PaymentStatusResponse refreshPaymentFromStripe(String sessionId) throws StripeException {
        // Attempt to retrieve the Stripe Session and the PaymentIntent to determine status
        com.stripe.model.checkout.Session stripeSession = com.stripe.model.checkout.Session.retrieve(sessionId);
        String paymentIntentId = stripeSession.getPaymentIntent();

        if (paymentIntentId != null) {
            PaymentIntent pi = PaymentIntent.retrieve(paymentIntentId);
            String piStatus = pi.getStatus(); // e.g., 'succeeded'

            if ("succeeded".equalsIgnoreCase(piStatus)) {
                // If succeeded, ensure our DB reflects it
                this.handlePaymentSuccess(sessionId, paymentIntentId);
            }
        }

        return getPaymentStatusBySession(sessionId);
    }

    /**
     * Get count of successful payments
     */
    @Transactional(readOnly = true)
    public long getSuccessfulPaymentCount() {
        return paymentRepository.countByStatus("SUCCESS");
    }

    /**
     * Get recent payments (limit specified)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecentPayments(int limit) {
        var allPayments = paymentRepository.findAll();
        return allPayments.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .map(payment -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", payment.getId().toString());
                    map.put("fineReference", payment.getFine().getReferenceNumber());
                    map.put("citizenName", payment.getCitizen().getFullName());
                    map.put("amount", payment.getAmount());
                    map.put("status", payment.getStatus());
                    map.put("createdAt", payment.getCreatedAt().toString());
                    map.put("fineId", payment.getFine().getId().toString());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPaymentsForCitizen(UUID citizenId) {
        var payments = paymentRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
        return payments.stream().map(payment -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", payment.getId().toString());
            map.put("fineReference", payment.getFine().getReferenceNumber());
            map.put("fineId", payment.getFine().getId().toString());
            map.put("amount", payment.getAmount());
            map.put("status", payment.getStatus());
            map.put("stripeSessionId", payment.getStripeSessionId());
            map.put("stripePaymentIntentId", payment.getStripePaymentIntentId());
            map.put("createdAt", payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : null);
            map.put("updatedAt", payment.getUpdatedAt() != null ? payment.getUpdatedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());
    }
}
