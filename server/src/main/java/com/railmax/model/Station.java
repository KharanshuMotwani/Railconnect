package com.railmax.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Stations")
@Data
@NoArgsConstructor
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stationId;

    @Column(nullable = false, unique = true, length = 10)
    private String stationCode;

    @Column(nullable = false, length = 100)
    private String stationName;
}
