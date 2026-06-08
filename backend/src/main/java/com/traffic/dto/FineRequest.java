package com.traffic.dto;

import lombok.Data;
import java.util.List;

@Data
public class FineRequest {
    private String citizenNic;
    private String location;
    private List<FineReasonDto> reasons;
}
