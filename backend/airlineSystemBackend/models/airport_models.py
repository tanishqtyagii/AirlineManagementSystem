from pydantic import BaseModel

class Airport(BaseModel):
    airport_code: str
    airport_name: str
    city: str
    country: str

class AirportCreate(BaseModel):
    airport_code: str
    airport_name: str
    city: str
    country: str
    