from fastapi import APIRouter
from models.airport_models import AirportCreate
import services.airport_service as service

router = APIRouter(prefix="/airports", tags=["Airports"])

@router.get("/")
def get_airports():
    return service.get_airports()

@router.post("/")
def add_airport(data: AirportCreate):
    service.add_airport(data)
    return {"message": "Airport added successfully"}

