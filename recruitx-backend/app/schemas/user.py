from pydantic import BaseModel
from app.models.user import RoleEnum

class UserCreate(BaseModel):
    email: str
    password: str
    role: RoleEnum

class UserResponse(BaseModel):
    id: int
    email: str
    role: RoleEnum

    class Config:
        orm_mode = True
