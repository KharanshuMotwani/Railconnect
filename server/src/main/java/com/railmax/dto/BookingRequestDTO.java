package com.railmax.dto;

import lombok.Data;

@Data
public class BookingRequestDTO {
    private Long userId; // For now assuming we pass user ID directly
    private Long scheduleId;
    private String seatNumber;
    private String berthPreference;
}
