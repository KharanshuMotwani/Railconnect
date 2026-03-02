package com.railmax.repository;

import com.railmax.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPnr(String pnr);
    List<Booking> findByUser_UserIdOrderByBookingDateDesc(Long userId);
}
