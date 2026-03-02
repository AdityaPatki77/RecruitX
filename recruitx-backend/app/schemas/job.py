from pydantic import BaseModel
from typing import Optional


class JobCreate(BaseModel):
    title: str
    company_name: str

    min_cgpa: float
    min_tenth: float
    min_twelfth: float
    max_backlogs: int

    department: Optional[str] = None
    required_skill: Optional[str] = None
    year_required: Optional[int] = None
    internship_required: bool = False

    # 🔥 NEW FIELD
    external_link: Optional[str] = None


class JobResponse(JobCreate):
    id: int
    is_approved: bool

    class Config:
        from_attributes = True