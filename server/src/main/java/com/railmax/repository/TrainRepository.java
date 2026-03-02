package com.railmax.repository;

import com.railmax.model.Train;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainRepository extends JpaRepository<Train, Long> {
    Train findByTrainNumber(String trainNumber);
}
