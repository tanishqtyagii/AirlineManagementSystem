from db import get_db

def get_passengers():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM passengers")
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows


def create_passenger(data):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO passengers (first_name, last_name, email, phone)
        VALUES (%s, %s, %s, %s)
        """,
        (data.first_name, data.last_name, data.email, data.phone),
    )
    db.commit()
    cursor.close()
    db.close()
    return True


def update_passenger(passenger_id, data):
    db = get_db()
    cursor = db.cursor()

    fields = []
    values = []

    if getattr(data, "first_name", None) is not None:
        fields.append("first_name = %s")
        values.append(data.first_name)

    if getattr(data, "last_name", None) is not None:
        fields.append("last_name = %s")
        values.append(data.last_name)

    if getattr(data, "email", None) is not None:
        fields.append("email = %s")
        values.append(data.email)

    if getattr(data, "phone", None) is not None:
        fields.append("phone = %s")
        values.append(data.phone)

    if not fields:
        cursor.close()
        db.close()
        return False

    query = f"UPDATE passengers SET {', '.join(fields)} WHERE passenger_id = %s"
    values.append(passenger_id)

    cursor.execute(query, tuple(values))
    db.commit()
    cursor.close()
    db.close()
    return True


def delete_passenger(passenger_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM passengers WHERE passenger_id = %s", (passenger_id,))
    db.commit()
    cursor.close()
    db.close()
    return True