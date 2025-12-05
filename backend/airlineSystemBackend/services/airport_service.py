from db import get_db

def get_airports():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM airports")
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows


def add_airport(data):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO airports (airport_code, airport_name, city, country)
        VALUES (%s, %s, %s, %s)
    """, (data.airport_code, data.airport_name, data.city, data.country))
    db.commit()
    cursor.close()
    db.close()
    return True
