package com.railmax.service;

import com.railmax.dto.TrainResponseDTO;
import com.railmax.model.Schedule;
import com.railmax.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainService {

    private final ScheduleRepository scheduleRepository;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public List<TrainResponseDTO> searchTrains(String from, String to, LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findSchedules(from, to, date);

        return schedules.stream().map(schedule -> {
            
            // Calculate Duration dynamically
            Duration duration = Duration.between(schedule.getDepartureTime(), schedule.getArrivalTime());
            if (duration.isNegative()) {
                duration = duration.plusHours(24); // next day arrival
            }
            long hours = duration.toHours();
            long minutes = duration.toMinutesPart();
            String durStr = String.format("%dh %02dm", hours, minutes);

            // Mock Smart Availability Logic based on availableSeats
            int seats = schedule.getAvailableSeats();
            String status = seats > 0 ? "AVAILABLE" : "WL";
            Integer wlPos = seats > 0 ? null : Math.abs(seats) + 1;
            String probability = null;

            if (status.equals("WL")) {
                if (wlPos < 20) probability = "High";
                else if (wlPos < 50) probability = "Medium";
                else probability = "Low";
            }

            return TrainResponseDTO.builder()
                    .scheduleId(schedule.getScheduleId())
                    .trainId(schedule.getTrain().getTrainId())
                    .name(schedule.getTrain().getTrainName())
                    .number(schedule.getTrain().getTrainNumber())
                    .from(schedule.getSourceStation().getStationName())
                    .to(schedule.getDestinationStation().getStationName())
                    .dep(schedule.getDepartureTime().format(TIME_FORMATTER))
                    .arr(schedule.getArrivalTime().format(TIME_FORMATTER))
                    .duration(durStr)
                    .fare(schedule.getBaseFare())
                    .seats(Math.max(seats, 0))
                    .status(status)
                    .wlPos(wlPos)
                    .probability(probability)
                    .build();
        }).collect(Collectors.toList());
    }
}
