package com.railmax.config;

import com.railmax.model.*;
import com.railmax.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StationRepository stationRepository;
    private final TrainRepository trainRepository;
    private final ScheduleRepository scheduleRepository;

    @Override
    public void run(String... args) throws Exception {
        
        // Ensure data is not seeded multiple times if db restarts
        if (userRepository.count() == 0) {
            
            System.out.println("Starting Database Seeding...");

            // 1. Seed User
            User user = new User();
            user.setName("Demo User");
            user.setEmail("user@railconnect.com");
            user.setPasswordHash("encrypted_pass_mock");
            userRepository.save(user);

            // 2. Seed Stations (Major hubs matching frontend UI defaults)
            Station bpl = new Station(); bpl.setStationCode("BPL"); bpl.setStationName("Bhopal JN");
            Station ndls = new Station(); ndls.setStationCode("NDLS"); ndls.setStationName("New Delhi");
            Station mmct = new Station(); mmct.setStationCode("MMCT"); mmct.setStationName("Mumbai Central");
            Station mas = new Station(); mas.setStationCode("MAS"); mas.setStationName("Chennai Central");
            Station nzm = new Station(); nzm.setStationCode("NZM"); nzm.setStationName("Nizamuddin");
            Station bsb = new Station(); bsb.setStationCode("BSB"); bsb.setStationName("Varanasi");
            Station krmi = new Station(); krmi.setStationCode("KRMI"); krmi.setStationName("Karmali");

            stationRepository.saveAll(List.of(bpl, ndls, mmct, mas, nzm, bsb, krmi));

            // 3. Seed Trains
            Train shatabdi = new Train(); shatabdi.setTrainNumber("12001"); shatabdi.setTrainName("Shatabdi Express"); shatabdi.setTotalSeats(45);
            Train rajdhani = new Train(); rajdhani.setTrainNumber("12951"); rajdhani.setTrainName("Rajdhani Express"); rajdhani.setTotalSeats(120);
            Train vande = new Train(); vande.setTrainNumber("22436"); vande.setTrainName("Vande Bharat Exp"); vande.setTotalSeats(300);
            Train duronto = new Train(); duronto.setTrainNumber("12269"); duronto.setTrainName("Duronto Express"); duronto.setTotalSeats(200);
            Train tejas = new Train(); tejas.setTrainNumber("82901"); tejas.setTrainName("Tejas Express"); tejas.setTotalSeats(80);

            trainRepository.saveAll(List.of(shatabdi, rajdhani, vande, duronto, tejas));

            // 4. Seed Schedules
            LocalDate dateOne = LocalDate.now(); // Available today
            LocalDate dateTwo = LocalDate.now().plusDays(1); // Available tomorrow
            
            // Shatabdi: Bhopal to New Delhi (Available)
            Schedule s1 = new Schedule();
            s1.setTrain(shatabdi);
            s1.setSourceStation(bpl);
            s1.setDestinationStation(ndls);
            s1.setTravelDate(dateOne);
            s1.setDepartureTime(LocalTime.of(15, 15));
            s1.setArrivalTime(LocalTime.of(23, 30));
            s1.setAvailableSeats(45);
            s1.setBaseFare(new BigDecimal("1245.00"));

            // Rajdhani: Mumbai to New Delhi (Waitlisted)
            Schedule s2 = new Schedule();
            s2.setTrain(rajdhani);
            s2.setSourceStation(mmct);
            s2.setDestinationStation(ndls);
            s2.setTravelDate(dateOne);
            s2.setDepartureTime(LocalTime.of(17, 0));
            s2.setArrivalTime(LocalTime.of(8, 32));
            s2.setAvailableSeats(-12); // Negative implies Waitlist 12
            s2.setBaseFare(new BigDecimal("2850.00"));

            // Vande Bharat: Varanasi to NDLS (Available)
            Schedule s3 = new Schedule();
            s3.setTrain(vande);
            s3.setSourceStation(bsb);
            s3.setDestinationStation(ndls);
            s3.setTravelDate(dateOne);
            s3.setDepartureTime(LocalTime.of(15, 0));
            s3.setArrivalTime(LocalTime.of(23, 0));
            s3.setAvailableSeats(2); 
            s3.setBaseFare(new BigDecimal("1750.00"));

            // Duronto: Chennai to Nizamuddin (Waitlisted heavy)
            Schedule s4 = new Schedule();
            s4.setTrain(duronto);
            s4.setSourceStation(mas);
            s4.setDestinationStation(nzm);
            s4.setTravelDate(dateTwo);
            s4.setDepartureTime(LocalTime.of(6, 35));
            s4.setArrivalTime(LocalTime.of(10, 40));
            s4.setAvailableSeats(-45); // WL 45
            s4.setBaseFare(new BigDecimal("3420.00"));

            // Tejas: Mumbai to Karmali
            Schedule s5 = new Schedule();
            s5.setTrain(tejas);
            s5.setSourceStation(mmct);
            s5.setDestinationStation(krmi);
            s5.setTravelDate(dateOne);
            s5.setDepartureTime(LocalTime.of(5, 50));
            s5.setArrivalTime(LocalTime.of(14, 20));
            s5.setAvailableSeats(-25); // WL 25
            s5.setBaseFare(new BigDecimal("1550.00"));

            scheduleRepository.saveAll(List.of(s1, s2, s3, s4, s5));
            
            System.out.println("✅ Mock Data Seeded Successfully into MySQL!");
        }
    }
}
