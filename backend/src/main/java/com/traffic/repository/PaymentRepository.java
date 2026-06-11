package com.traffic.repository;

import com.traffic.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByStripeSessionId(String stripeSessionId);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Payment> findByFineId(UUID fineId);

    List<Payment> findByCitizenIdOrderByCreatedAtDesc(UUID citizenId);

    List<Payment> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);
}
