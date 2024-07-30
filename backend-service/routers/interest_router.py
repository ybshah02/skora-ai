from fastapi import APIRouter
from pydantic import BaseModel, Field

from models import db

router = APIRouter()
db = db.DB()

class AddInterestRequest(BaseModel):
    email: str = Field(..., description="interest form email of user")

@router.post('/add')
def add_interest(request: AddInterestRequest):
    if request.email:
        db.add_interest(request.email)
    else:
        return {"status": "error"}

    return {"status": "success"}