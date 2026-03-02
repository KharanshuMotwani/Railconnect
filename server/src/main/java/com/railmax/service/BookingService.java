package com.railmax.service;

import com.railmax.dto.BookingRequestDTO;
import com.railmax.dto.BookingResponseDTO;
import com.railmax.model.Booking;
import com.railmax.model.Schedule;
import com.railmax.model.User;
import com.railmax.repository.BookingRepository;
import com.railmax.repository.ScheduleRepository;
import com.railmax.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponseDTO bookTicket(BookingRequestDTO request) {
        
        // Hardcode user fetch for now to simplify (Assuming ID 1 exists)
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
            .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // Deduct seat
        int currentSeats = schedule.getAvailableSeats();
        schedule.setAvailableSeats(currentSeats - 1);
        scheduleRepository.save(schedule); // Concurrency: In real word, requires Optimistic Locking

        Booking.BookingStatus status = currentSeats > 0 ? Booking.BookingStatus.CONFIRMED : Booking.BookingStatus.WL;
        String generatedPnr = generatePNR();

        Booking booking = new Booking();
        booking.setPnr(generatedPnr);
        booking.setUser(user);
        booking.setSchedule(schedule);
        booking.setSeatNumber(request.getSeatNumber());
        booking.setBerthPreference(request.getBerthPreference());
        booking.setStatus(status);
        booking.setPaymentStatus(Booking.PaymentStatus.SUCCESS); // Assuming payment success immediately
        booking.setBookingDate(LocalDateTime.now());

        bookingRepository.save(booking);

        return BookingResponseDTO.builder()
                .pnr(booking.getPnr())
                .status(booking.getStatus().name())
                .seatNumber(booking.getSeatNumber())
                .berthPreference(booking.getBerthPreference())
                .trainName(schedule.getTrain().getTrainName())
                .trainNumber(schedule.getTrain().getTrainNumber())
                .message("Booking Successful")
                .build();
    }

    private String generatePNR() {
        Random random = new Random();
        StringBuilder pnr = new StringBuilder(String.valueOf(random.nextInt(9) + 1)); // First digit 1-9
        for (int i = 0; i < 9; i++) {
            pnr.append(random.nextInt(10));
        }
        return pnr.toString();
    }
}
