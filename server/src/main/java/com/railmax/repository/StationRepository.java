package com.railmax.repository;

import com.railmax.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationRepository extends JpaRepository<Station, Long> {
    Station findByStationCode(String stationCode);
}
