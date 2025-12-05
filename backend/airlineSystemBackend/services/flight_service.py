from db import get_db

# returns all posted flights
def get_all_flights():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM flights")
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows

# posts flights by ids
def get_flight_by_id(flight_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM flights WHERE flight_id = %s", (flight_id,))
    row = cursor.fetchone()
    cursor.close()
    db.close()
    return row

# Filters
def get_flights_by_arriving_airport(airport_name: str):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM flights WHERE arrival_airport = %s",
        (airport_name,)
    )
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows

def get_flights_by_departing_airport(airport_name: str):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM flights WHERE departure_airport = %s",
        (airport_name,)
    )
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows

# returns flights by their arriving airport and departing airport
def get_flights_by_both(arrival_airport: str, departure_airport: str):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT * FROM flights
        WHERE arrival_airport = %s AND departure_airport = %s
        """,
        (arrival_airport, departure_airport),
    )
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows

# creates a new flight
def create_flight(data):
    db = get_db()
    cursor = db.cursor()
    query = """
        INSERT INTO flights (flight_number, departure_airport, arrival_airport, departure_time, arrival_time, status)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (
        data.flight_number,
        data.departure_airport,
        data.arrival_airport,
        data.departure_time,
        data.arrival_time,
        data.status
    ))
    db.commit()
    cursor.close()
    db.close()
    return True

# updates a flight record
def update_flight(flight_id, data):
    db = get_db()
    cursor = db.cursor()

    update_fields = []
    values = []

    for key, value in data.dict(exclude_unset=True).items():
        update_fields.append(f"{key} = %s")
        values.append(value)

    values.append(flight_id)

    query = f"UPDATE flights SET {', '.join(update_fields)} WHERE flight_id = %s"

    cursor.execute(query, tuple(values))
    db.commit()
    cursor.close()
    db.close()

    return True

# deletes a flight
def delete_flight(flight_id: int):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM flights WHERE flight_id = %s", (flight_id,))
    db.commit()
    cursor.close()
    db.close()
    return True