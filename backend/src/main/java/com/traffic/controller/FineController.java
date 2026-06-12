package com.traffic.controller;

import com.traffic.dto.FineReasonDto;
import com.traffic.dto.FineResponse;
import com.traffic.entity.Fine;
import com.traffic.entity.Payment;
import com.traffic.entity.User;
import com.traffic.repository.FineRepository;
import com.traffic.repository.PaymentRepository;
import com.traffic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class FineController {

    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @GetMapping("/fines")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<FineResponse>> getMyFines() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        List<Fine> fines = fineRepository.findByCitizenIdOrderByCreatedAtDesc(user.getId());
        
        List<FineResponse> responses = fines.stream().map(fine -> {
            // Fetch last payment for this fine
            Optional<Payment> lastPayment = paymentRepository.findTopByFineIdOrderByCreatedAtDesc(fine.getId());
            
            FineResponse.FineResponseBuilder builder = FineResponse.builder()
                    .id(fine.getId().toString())
                    .referenceNumber(fine.getReferenceNumber())
                    .citizenName(fine.getCitizen().getFullName())
                    .citizenNic(fine.getCitizen().getNic())
                    .policeId(fine.getPoliceOfficer().getPoliceId())
                    .fineDate(fine.getFineDate())
                    .fineTime(fine.getFineTime())
                    .location(fine.getLocation())
                    .reasons(fine.getReasons().stream().map(r -> new FineReasonDto(r.getReason(), r.getAmount())).collect(Collectors.toList()))
                    .totalAmount(fine.getTotalAmount())
                    .status(fine.getStatus())
                    .bankName(fine.getBankName())
                    .bankAccountNumber(fine.getBankAccountNumber());
            
            // Add payment info if available
            if (lastPayment.isPresent()) {
                Payment payment = lastPayment.get();
                builder.paymentId(payment.getId().toString())
                       .lastPaymentDate(payment.getUpdatedAt())
                       .paymentStatus(payment.getStatus());
            }
            
            return builder.build();
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
}
