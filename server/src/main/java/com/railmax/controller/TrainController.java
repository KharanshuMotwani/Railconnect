package com.railmax.controller;

import com.railmax.dto.TrainResponseDTO;
import com.railmax.service.TrainService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trains")
@RequiredArgsConstructor
public class TrainController {

    private final TrainService trainService;

    @GetMapping("/search")
    public ResponseEntity<List<TrainResponseDTO>> searchTrains(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        return ResponseEntity.ok(trainService.searchTrains(from, to, date));
    }
}
