-- RailMax Application Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stations Table
CREATE TABLE IF NOT EXISTS Stations (
    station_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_code VARCHAR(10) UNIQUE NOT NULL,
    station_name VARCHAR(100) NOT NULL
);

-- Trains Table
CREATE TABLE IF NOT EXISTS Trains (
    train_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(20) UNIQUE NOT NULL,
    train_name VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS Schedules (
    schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    train_id BIGINT NOT NULL,
    source_station_id BIGINT NOT NULL,
    destination_station_id BIGINT NOT NULL,
    travel_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    available_seats INT NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (train_id) REFERENCES Trains(train_id),
    FOREIGN KEY (source_station_id) REFERENCES Stations(station_id),
    FOREIGN KEY (destination_station_id) REFERENCES Stations(station_id)
);

-- Indexing on Schedules for Fast Search
CREATE INDEX idx_schedule_search ON Schedules(source_station_id, destination_station_id, travel_date);
CREATE INDEX idx_train_date ON Schedules(train_id, travel_date);

-- Bookings Table
CREATE TABLE IF NOT EXISTS Bookings (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pnr VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    schedule_id BIGINT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seat_number VARCHAR(10),
    berth_preference VARCHAR(20),
    status ENUM('CONFIRMED', 'WL', 'CANCELLED') NOT NULL,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (schedule_id) REFERENCES Schedules(schedule_id)
);

-- Indexing on Bookings for Status/PNR Lookups
CREATE INDEX idx_pnr ON Bookings(pnr);
CREATE INDEX idx_user_bookings ON Bookings(user_id, booking_date DESC);
