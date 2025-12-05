from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Booking(BaseModel):
    booking_id: int
    passenger_id: int
    flight_id: int
    booking_date: datetime
    seat_number: Optional[str] = None
    fare_class: Optional[str] = None
    status: str

class BookingCreate(BaseModel):
    passenger_id: int
    flight_id: int
    seat_number: Optional[str] = None
    fare_class: Optional[str] = None

class BookingUpdate(BaseModel):
    seat_number: Optional[str] = None
    fare_class: Optional[str] = None
    status: Optional[str] = None