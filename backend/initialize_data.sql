CREATE DATABASE IF NOT EXISTS airline;
USE airline;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE bookings;
TRUNCATE TABLE passengers;
TRUNCATE TABLE flights;
TRUNCATE TABLE airports;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO airports (airport_code, airport_name, city, country) VALUES
('SFO', 'San Francisco International Airport', 'San Francisco', 'USA'),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA'),
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA'),
('ORD', "O'Hare International Airport", 'Chicago', 'USA'),
('ATL', 'Hartsfield–Jackson Atlanta International Airport', 'Atlanta', 'USA'),
('DFW', 'Dallas/Fort Worth International Airport', 'Dallas', 'USA'),
('DEN', 'Denver International Airport', 'Denver', 'USA'),
('SEA', 'Seattle-Tacoma International Airport', 'Seattle', 'USA'),
('BOS', 'Logan International Airport', 'Boston', 'USA'),
('MIA', 'Miami International Airport', 'Miami', 'USA'),
('IAH', 'George Bush Intercontinental Airport', 'Houston', 'USA'),
('PHX', 'Phoenix Sky Harbor International Airport', 'Phoenix', 'USA'),
('LAS', 'Harry Reid International Airport', 'Las Vegas', 'USA'),
('CLT', 'Charlotte Douglas International Airport', 'Charlotte', 'USA'),
('EWR', 'Newark Liberty International Airport', 'Newark', 'USA');

INSERT INTO flights (
  flight_number,
  departure_airport,
  arrival_airport,
  departure_time,
  arrival_time,
  status
) VALUES
('AT101', 'SFO', 'LAX', '2025-12-10 08:00:00', '2025-12-10 09:30:00', 'On Time'),
('AT102', 'LAX', 'JFK', '2025-12-10 10:00:00', '2025-12-10 18:15:00', 'On Time'),
('AT103', 'JFK', 'SFO', '2025-12-11 07:45:00', '2025-12-11 11:15:00', 'Delayed'),
('AT104', 'ORD', 'ATL', '2025-12-11 09:00:00', '2025-12-11 11:00:00', 'On Time'),
('AT105', 'ATL', 'MIA', '2025-12-11 13:00:00', '2025-12-11 14:45:00', 'On Time'),
('AT106', 'DFW', 'DEN', '2025-12-12 06:30:00', '2025-12-12 08:10:00', 'On Time'),
('AT107', 'DEN', 'SEA', '2025-12-12 09:00:00', '2025-12-12 11:15:00', 'On Time'),
('AT108', 'SEA', 'BOS', '2025-12-12 12:30:00', '2025-12-12 20:30:00', 'Delayed'),
('AT109', 'BOS', 'IAH', '2025-12-13 07:00:00', '2025-12-13 10:15:00', 'On Time'),
('AT110', 'IAH', 'PHX', '2025-12-13 12:00:00', '2025-12-13 13:45:00', 'On Time'),
('AT111', 'PHX', 'LAS', '2025-12-13 15:00:00', '2025-12-13 16:00:00', 'On Time'),
('AT112', 'LAS', 'CLT', '2025-12-14 09:30:00', '2025-12-14 15:30:00', 'Cancelled'),
('AT113', 'CLT', 'EWR', '2025-12-14 17:00:00', '2025-12-14 18:45:00', 'On Time'),
('AT114', 'EWR', 'SFO', '2025-12-15 06:15:00', '2025-12-15 09:45:00', 'On Time'),
('AT115', 'MIA', 'LAX', '2025-12-15 11:00:00', '2025-12-15 14:15:00', 'Delayed');

INSERT INTO passengers (first_name, last_name, email, phone) VALUES
('Alice',    'Nguyen',     'alice.nguyen@example.com',      '+1-555-0101'),
('Brian',    'Lopez',      'brian.lopez@example.com',       '+1-555-0102'),
('Carla',    'Patel',      'carla.patel@example.com',       '+1-555-0103'),
('David',    'Kim',        'david.kim@example.com',         '+1-555-0104'),
('Elena',    'Rodriguez',  'elena.rodriguez@example.com',   '+1-555-0105'),
('Farhan',   'Ali',        'farhan.ali@example.com',        '+1-555-0106'),
('Grace',    'Thompson',   'grace.thompson@example.com',    '+1-555-0107'),
('Henry',    'Johnson',    'henry.johnson@example.com',     '+1-555-0108'),
('Isabella', 'Martinez',   'isabella.martinez@example.com', '+1-555-0109'),
('Jacob',    'Brown',      'jacob.brown@example.com',       '+1-555-0110'),
('Kara',     'Wilson',     'kara.wilson@example.com',       '+1-555-0111'),
('Liam',     'Anderson',   'liam.anderson@example.com',     '+1-555-0112'),
('Maya',     'Singh',      'maya.singh@example.com',        '+1-555-0113'),
('Noah',     'Davis',      'noah.davis@example.com',        '+1-555-0114'),
('Olivia',   'Miller',     'olivia.miller@example.com',     '+1-555-0115');

INSERT INTO bookings (
  passenger_id,
  flight_id,
  booking_date,
  seat_number,
  fare_class,
  status
) VALUES
(1,  1,  '2025-11-20 10:00:00', '12A', 'Economy',          'CONFIRMED'),
(2,  1,  '2025-11-21 09:30:00', '14C', 'Economy',          'CHECKED_IN'),
(3,  2,  '2025-11-22 15:45:00', '02B', 'Business',         'CONFIRMED'),
(4,  3,  '2025-11-23 08:10:00', '18F', 'Economy',          'CONFIRMED'),
(5,  4,  '2025-11-24 11:20:00', '04A', 'Business',         'CONFIRMED'),
(6,  5,  '2025-11-24 12:05:00', '20D', 'Economy',          'CANCELLED'),
(7,  6,  '2025-11-25 07:50:00', '08C', 'Premium Economy',  'CONFIRMED'),
(8,  7,  '2025-11-25 09:00:00', '10A', 'Economy',          'CHECKED_IN'),
(9,  8,  '2025-11-26 13:15:00', '03D', 'Business',         'CONFIRMED'),
(10, 9,  '2025-11-26 14:40:00', '21B', 'Economy',          'CONFIRMED'),
(11, 10, '2025-11-27 10:05:00', '06F', 'Premium Economy',  'CONFIRMED'),
(12, 11, '2025-11-27 16:30:00', '15A', 'Economy',          'CHECKED_IN'),
(13, 12, '2025-11-28 09:25:00', '01C', 'First',            'CANCELLED'),
(14, 13, '2025-11-29 08:50:00', '19E', 'Economy',          'CONFIRMED'),
(15, 14, '2025-11-30 11:10:00', '07B', 'Business',         'CONFIRMED');

INSERT INTO bookings (
  passenger_id,
  flight_id,
  booking_date,
  seat_number,
  fare_class,
  status
) VALUES
(1, 15, '2025-11-30 13:00:00', '09C', 'Economy', 'CONFIRMED');