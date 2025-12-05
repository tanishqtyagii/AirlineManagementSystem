from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models.booking_models import Booking, BookingCreate, BookingUpdate
import services.booking_service as service

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.get("/", response_model=List[Booking])
def get_bookings(
    flight_id: Optional[int] = Query(default=None),
    passenger_id: Optional[int] = Query(default=None),
):
    # Filter by flight
    if flight_id is not None:
        return service.get_bookings_by_flight(flight_id)
    # No filter: return all
    return service.get_bookings()

@router.post("/")
def create_booking(data: BookingCreate):
    ok = service.create_booking(data)
    if not ok:
        raise HTTPException(status_code=400, detail="Could not create booking")
    return {"message": "Booking created"}

@router.put("/{booking_id}")
def update_booking(booking_id: int, data: BookingUpdate):
    updated = service.update_booking(booking_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Booking not found or nothing to update")
    return {"message": "Booking updated"}

@router.delete("/{booking_id}")
def delete_booking(booking_id: int):
    deleted = service.delete_booking(booking_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted"}