package com.railmax.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponseDTO {
    private String pnr;
    private String status;
    private String seatNumber;
    private String berthPreference;
    private String trainName;
    private String trainNumber;
    private String message;
}
