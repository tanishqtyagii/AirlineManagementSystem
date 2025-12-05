from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models.flight_models import Flight, FlightCreate, FlightUpdate
import services.flight_service as service
from models.booking_models import Booking
import services.booking_service as booking_service

router = APIRouter(prefix="/flights", tags=["Flights"])

@router.get("/", response_model=List[Flight])
def get_flights(arrival_airport: Optional[str] = Query(default=None),
    departure_airport: Optional[str] = Query(default=None),
):
    # Returns full list if no filter
    if not arrival_airport and not departure_airport:
        return service.get_all_flights()

    # Only Arrival filter
    if arrival_airport and not departure_airport:
        return service.get_flights_by_arriving_airport(arrival_airport)

    # Only Departure filter
    if departure_airport and not arrival_airport:
        return service.get_flights_by_departing_airport(departure_airport)

    # Both Departure and Arrival Filter
    return service.get_flights_by_both(arrival_airport, departure_airport)

@router.get("/{flight_id}")
def get_flight(flight_id: int):
    flight = service.get_flight_by_id(flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight

@router.post("/")
def create_flight(data: FlightCreate):
    service.create_flight(data)
    return {"message": "Flight created"}

@router.put("/{flight_id}")
def update_flight(flight_id: int, data: FlightUpdate):
    service.update_flight(flight_id, data)
    return {"message": "Flight updated"}

@router.delete("/{flight_id}")
def delete_flight(flight_id: int):
    service.delete_flight(flight_id)
    return {"message": "Flight deleted"}

@router.get("/{flight_id}/bookings")
def get_flight_bookings(flight_id: int):
    bookings = booking_service.get_bookings_by_flight(flight_id)
    return bookings