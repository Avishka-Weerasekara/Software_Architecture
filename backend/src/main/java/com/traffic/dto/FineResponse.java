package com.traffic.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class FineResponse {
    private String id;
    private String referenceNumber;
    private String citizenName;
    private String citizenNic;
    private String policeId;
    private String fineDate;
    private String fineTime;
    private String location;
    private List<FineReasonDto> reasons;
    private Double totalAmount;
    private String status;
    private String bankName;
    private String bankAccountNumber;
}
