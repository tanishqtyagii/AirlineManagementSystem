CREATE DATABASE IF NOT EXISTS airline;
USE airline;

CREATE TABLE IF NOT EXISTS airports (
    airport_code VARCHAR(10) PRIMARY KEY,
    airport_name VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS flights (
    flight_id INT AUTO_INCREMENT,
    flight_number VARCHAR(20),
    departure_airport VARCHAR(10),
    arrival_airport VARCHAR(10),
    departure_time DATETIME,
    arrival_time DATETIME,
    status VARCHAR(20),
    PRIMARY KEY (flight_id),
    FOREIGN KEY (departure_airport) REFERENCES airports(airport_code),
    FOREIGN KEY (arrival_airport) REFERENCES airports(airport_code)
);

CREATE TABLE IF NOT EXISTS passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name   VARCHAR(50),
    last_name    VARCHAR(50),
    email        VARCHAR(100) UNIQUE,
    phone        VARCHAR(20)
    );

CREATE TABLE IF NOT EXISTS bookings (
    booking_id    INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id  INT NOT NULL,
    flight_id     INT NOT NULL,
    booking_date  DATETIME NOT NULL,
    seat_number   VARCHAR(5),
    fare_class    VARCHAR(20),  -- e.g. Economy, Business
    status        VARCHAR(20),  -- e.g. CONFIRMED, CANCELLED, CHECKED_IN

    FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id),
    FOREIGN KEY (flight_id)    REFERENCES flights(flight_id)
);