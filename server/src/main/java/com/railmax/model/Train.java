package com.railmax.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Trains")
@Data
@NoArgsConstructor
public class Train {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trainId;

    @Column(nullable = false, unique = true, length = 20)
    private String trainNumber;

    @Column(nullable = false, length = 100)
    private String trainName;

    @Column(nullable = false)
    private Integer totalSeats;
}
