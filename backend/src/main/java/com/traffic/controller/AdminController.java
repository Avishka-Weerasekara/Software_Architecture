package com.traffic.controller;

import com.traffic.dto.FineReasonDto;
import com.traffic.dto.FineRequest;
import com.traffic.dto.FineResponse;
import com.traffic.entity.CitizenUser;
import com.traffic.entity.Fine;
import com.traffic.entity.FineReason;
import com.traffic.entity.PoliceUser;
import com.traffic.repository.FineRepository;
import com.traffic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;



@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final FineRepository fineRepository;

    @GetMapping("/users/search")
    public ResponseEntity<?> searchUserByNic(@RequestParam String nic) {
        java.util.Optional<CitizenUser> citizen = userRepository.findCitizenByNic(nic);
        if (citizen.isPresent()) {
            return ResponseEntity.ok(citizen.get());
        } else {
            return ResponseEntity.badRequest().body("No citizen found with NIC: " + nic);
        }
    }




    @PostMapping("/fines")
    public ResponseEntity<FineResponse> issueFine(@RequestBody FineRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PoliceUser police = (PoliceUser) userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Police officer not found"));

        CitizenUser citizen = userRepository.findCitizenByNic(request.getCitizenNic())
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        double totalAmount = request.getReasons().stream()
                .mapToDouble(FineReasonDto::getAmount)
                .sum();

        List<FineReason> reasons = request.getReasons().stream()
                .map(dto -> new FineReason(dto.getReason(), dto.getAmount()))
                .collect(Collectors.toList());

        String referenceNumber = "TF-" + System.currentTimeMillis();

        Fine fine = Fine.builder()
                .referenceNumber(referenceNumber)
                .citizen(citizen)
                .policeOfficer(police)
                .fineDate(LocalDate.now().toString())
                .fineTime(LocalTime.now().toString())
                .location(request.getLocation())
                .reasons(reasons)
                .totalAmount(totalAmount)
                .status("PENDING")
                .bankName("Bank of Ceylon")
                .bankAccountNumber("BOC-84920381")
                .build();

        fine = fineRepository.save(fine);

        return ResponseEntity.ok(FineResponse.builder()
                .id(fine.getId().toString())
                .referenceNumber(fine.getReferenceNumber())
                .citizenName(citizen.getFullName())
                .citizenNic(citizen.getNic())
                .policeId(police.getPoliceId())
                .fineDate(fine.getFineDate())
                .fineTime(fine.getFineTime())
                .location(fine.getLocation())
                .reasons(request.getReasons())
                .totalAmount(fine.getTotalAmount())
                .status(fine.getStatus())
                .bankName(fine.getBankName())
                .bankAccountNumber(fine.getBankAccountNumber())
                .build());
    }
}
