package com.railmax.controller;

import com.railmax.dto.BookingRequestDTO;
import com.railmax.dto.BookingResponseDTO;
import com.railmax.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponseDTO> bookTicket(@RequestBody BookingRequestDTO requestDTO) {
        return ResponseEntity.ok(bookingService.bookTicket(requestDTO));
    }
}
