from db import get_db

def get_bookings():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT 
            b.*, 
            p.first_name, 
            p.last_name, 
            p.email,
            f.flight_number
        FROM bookings b
        JOIN passengers p ON b.passenger_id = p.passenger_id
        JOIN flights f    ON b.flight_id = f.flight_id
        """
    )
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows


def get_bookings_by_flight(flight_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT 
            b.*, 
            p.first_name, 
            p.last_name, 
            p.email
        FROM bookings b
        JOIN passengers p ON b.passenger_id = p.passenger_id
        WHERE b.flight_id = %s
        """,
        (flight_id,),
    )
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows


def get_bookings_by_passenger(passenger_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT 
            b.*, 
            f.flight_number,
            f.departure_airport,
            f.arrival_airport,
            f.departure_time,
            f.arrival_time
        FROM bookings b
        JOIN flights f ON b.flight_id = f.flight_id
        WHERE b.passenger_id = %s
        """,
        (passenger_id,),
    )
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows


def create_booking(data):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO bookings (
            passenger_id, 
            flight_id, 
            booking_date, 
            seat_number, 
            fare_class,
            status
        )
        VALUES (%s, %s, NOW(), %s, %s, %s)
        """,
        (
            data.passenger_id,
            data.flight_id,
            getattr(data, "seat_number", None),
            getattr(data, "fare_class", None),
            "CONFIRMED",
        ),
    )
    db.commit()
    cursor.close()
    db.close()
    return True


def update_booking(booking_id: int, data):
    db = get_db()
    cursor = db.cursor()

    fields = []
    values = []

    if getattr(data, "seat_number", None) is not None:
        fields.append("seat_number = %s")
        values.append(data.seat_number)

    if getattr(data, "fare_class", None) is not None:
        fields.append("fare_class = %s")
        values.append(data.fare_class)

    if getattr(data, "status", None) is not None:
        fields.append("status = %s")
        values.append(data.status)

    if not fields:
        cursor.close()
        db.close()
        return False

    query = f"UPDATE bookings SET {', '.join(fields)} WHERE booking_id = %s"
    values.append(booking_id)

    cursor.execute(query, tuple(values))
    db.commit()
    cursor.close()
    db.close()
    return True


def delete_booking(booking_id: int):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM bookings WHERE booking_id = %s", (booking_id,))
    db.commit()
    cursor.close()
    db.close()
    return True