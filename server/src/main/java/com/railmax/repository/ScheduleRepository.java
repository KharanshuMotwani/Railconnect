package com.railmax.repository;

import com.railmax.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    
    // Find trains matching a specific source, destination, and date.
    @Query("SELECT s FROM Schedule s WHERE s.sourceStation.stationName LIKE %:source% " +
           "AND s.destinationStation.stationName LIKE %:destination% " +
           "AND s.travelDate = :date")
    List<Schedule> findSchedules(@Param("source") String source, 
                                 @Param("destination") String destination, 
                                 @Param("date") LocalDate date);
}
