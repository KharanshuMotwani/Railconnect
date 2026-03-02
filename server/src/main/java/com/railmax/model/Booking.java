package com.railmax.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Bookings")
@Data
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(nullable = false, unique = true, length = 20)
    private String pnr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @Column(nullable = false, updatable = false)
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Column(length = 10)
    private String seatNumber;

    @Column(length = 20)
    private String berthPreference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    public enum BookingStatus {
        CONFIRMED, WL, CANCELLED
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED
    }
}
