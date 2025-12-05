from typing import List
from fastapi import APIRouter, HTTPException
from models.passenger_models import Passenger, PassengerCreate, PassengerUpdate
import services.passenger_service as service

router = APIRouter(prefix="/passengers", tags=["Passengers"])

@router.get("/", response_model=List[Passenger])
def get_passengers():
    return service.get_passengers()

@router.post("/")
def create_passenger(data: PassengerCreate):
    service.create_passenger(data)
    return {"message": "Passenger created"}

@router.put("/{passenger_id}")
def update_passenger(passenger_id: int, data: PassengerUpdate):
    updated = service.update_passenger(passenger_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Passenger not found or nothing to update")
    return {"message": "Passenger updated"}

@router.delete("/{passenger_id}")
def delete_passenger(passenger_id: int):
    deleted = service.delete_passenger(passenger_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return {"message": "Passenger deleted"}