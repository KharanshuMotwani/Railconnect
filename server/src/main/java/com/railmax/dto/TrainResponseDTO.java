package com.railmax.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainResponseDTO {
    private Long scheduleId;
    private Long trainId;
    private String name;
    private String number;
    private String from;
    private String to;
    private String dep;
    private String arr;
    private String duration;
    private BigDecimal fare;
    private Integer seats;
    private String status; // AVAILABLE, WL
    private Integer wlPos;
    private String probability; // High, Medium, Low
}
