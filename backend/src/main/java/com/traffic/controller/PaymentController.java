package com.traffic.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.traffic.dto.PaymentInitiateRequest;
import com.traffic.dto.PaymentInitiateResponse;
import com.traffic.dto.PaymentStatusResponse;
import com.traffic.entity.User;
import com.traffic.repository.UserRepository;
import com.traffic.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    /**
     * Initiate payment for a fine
     * User must be authenticated (CITIZEN role)
     */
    @PostMapping("/initiate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> initiatePayment(@RequestBody PaymentInitiateRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            PaymentInitiateResponse response = paymentService.initiatePayment(request, user.getId());
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Stripe error during payment initiation: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body(Map.of(
                    "error", "Failed to initiate payment",
                    "details", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error during payment initiation: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body(Map.of(
                    "error", "Payment initiation failed",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * Stripe webhook endpoint for payment events
     * This is called by Stripe to notify us of payment status changes
     */
    @PostMapping("/webhook/stripe")
    public ResponseEntity<?> handleStripeWebhook(@RequestBody String payload,
                                                  @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            switch (event.getType()) {
                case "checkout.session.completed":
                    handleCheckoutCompleted(event);
                    break;

                case "checkout.session.async_payment_failed":
                    handleCheckoutFailed(event);
                    break;

                case "payment_intent.payment_failed":
                    handlePaymentIntentFailed(event);
                    break;

                default:
                    log.warn("Unhandled Stripe event type: {}", event.getType());
            }

            return ResponseEntity.ok(Map.of("received", true));
        } catch (com.stripe.exception.SignatureVerificationException e) {
            log.error("Invalid Stripe signature: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", "Invalid signature"));
        } catch (Exception e) {
            log.error("Error processing Stripe webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Webhook processing failed"));
        }
    }

    /**
     * Handle checkout.session.completed event
     */
    private void handleCheckoutCompleted(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = deserializer.getObject().orElse(null);

        if (stripeObject instanceof Session) {
            Session session = (Session) stripeObject;
            String sessionId = session.getId();
            String paymentIntentId = session.getPaymentIntent();

            log.info("Checkout completed for session: {}", sessionId);
            paymentService.handlePaymentSuccess(sessionId, paymentIntentId);
        }
    }

    /**
     * Handle checkout.session.async_payment_failed event
     */
    private void handleCheckoutFailed(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = deserializer.getObject().orElse(null);

        if (stripeObject instanceof Session) {
            Session session = (Session) stripeObject;
            String sessionId = session.getId();

            log.info("Checkout failed for session: {}", sessionId);
            paymentService.handlePaymentFailure(sessionId);
        }
    }

    /**
     * Handle payment_intent.payment_failed event
     */
    private void handlePaymentIntentFailed(Event event) {
        log.info("Payment intent failed event received");
        // This can be handled similarly if needed
    }

    /**
     * Get payment status
     * User can only see their own payments
     */
    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getPaymentStatus(@PathVariable UUID paymentId) {
        try {
            PaymentStatusResponse response = paymentService.getPaymentStatus(paymentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching payment status: {}", e.getMessage());
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get payment status by Stripe Checkout session ID
     * This is used by the frontend to poll for completion after redirect
     */
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getPaymentStatusBySession(@PathVariable String sessionId) {
        try {
            PaymentStatusResponse response = paymentService.getPaymentStatusBySession(sessionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching payment by session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Refresh payment status by querying Stripe directly (useful for local testing when webhooks are not configured)
     */
    @GetMapping("/session/{sessionId}/refresh")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> refreshPaymentBySession(@PathVariable String sessionId) {
        try {
            PaymentStatusResponse response = paymentService.refreshPaymentFromStripe(sessionId);
            return ResponseEntity.ok(response);
        } catch (com.stripe.exception.StripeException e) {
            log.error("Stripe API error while refreshing session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Stripe API error", "details", e.getMessage()));
        } catch (Exception e) {
            log.error("Error refreshing payment by session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get payments for the currently authenticated user (citizen)
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyPayments() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            var user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            var citizenId = user.getId();
            var payments = paymentService.getPaymentsForCitizen(citizenId);
            return ResponseEntity.ok(Map.of("payments", payments));
        } catch (Exception e) {
            log.error("Error fetching payments for current user: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // --- Temporary debug endpoints (UNPROTECTED) - remove for production ---
    @GetMapping("/debug/findByAmount/{amount}")
    public ResponseEntity<?> debugFindByAmount(@PathVariable Double amount) {
        try {
            var payments = paymentService.getRecentPayments(100);
            var matched = payments.stream().filter(p -> {
                try {
                    Double a = Double.parseDouble(String.valueOf(p.get("amount")));
                    return Double.compare(a, amount) == 0;
                } catch (Exception e) {
                    return false;
                }
            }).toList();
            return ResponseEntity.ok(Map.of("matches", matched));
        } catch (Exception e) {
            log.error("Debug findByAmount error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/debug/refreshSession/{sessionId}")
    public ResponseEntity<?> debugRefreshSession(@PathVariable String sessionId) {
        try {
            PaymentStatusResponse response = paymentService.refreshPaymentFromStripe(sessionId);
            return ResponseEntity.ok(response);
        } catch (com.stripe.exception.StripeException e) {
            log.error("Stripe API error while debug refreshing session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Stripe API error", "details", e.getMessage()));
        } catch (Exception e) {
            log.error("Error debug refreshing payment by session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Process refund (admin-only)
     */
    @PutMapping("/{paymentId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refundPayment(
            @PathVariable UUID paymentId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String refundReason = request != null ? request.get("reason") : "Admin initiated refund";
            paymentService.processRefund(paymentId, refundReason);
            return ResponseEntity.ok(Map.of("message", "Refund processed successfully"));
        } catch (StripeException e) {
            log.error("Stripe error during refund: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body(Map.of(
                    "error", "Refund failed",
                    "details", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error processing refund: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body(Map.of(
                    "error", "Refund processing failed",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * Get payment analytics (admin-only)
     */
    @GetMapping("/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentAnalytics() {
        try {
            Double totalRevenue = paymentService.getTotalRevenue();
            long successfulCount = paymentService.getSuccessfulPaymentCount();

            return ResponseEntity.ok(Map.of(
                    "totalRevenue", totalRevenue != null ? totalRevenue : 0,
                    "successfulPayments", successfulCount,
                    "currency", "LKR"
            ));
        } catch (Exception e) {
            log.error("Error fetching payment analytics: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch analytics"
            ));
        }
    }

    /**
     * Get recent payments (admin-only)
     */
    @GetMapping("/admin/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRecentPayments(@RequestParam(defaultValue = "10") int limit) {
        try {
            var payments = paymentService.getRecentPayments(limit);
            return ResponseEntity.ok(Map.of(
                    "payments", payments,
                    "count", payments.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching recent payments: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch recent payments"
            ));
        }
    }
}
