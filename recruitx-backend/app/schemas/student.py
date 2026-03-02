from pydantic import BaseModel
from typing import Optional


class StudentCreate(BaseModel):
    """Fields the student can update themselves."""
    full_name:             Optional[str]   = None
    phone:                 Optional[str]   = None
    skills:                Optional[str]   = None
    internship_experience: Optional[str]   = None
    experience_months:     Optional[int]   = None
    linkedin:              Optional[str]   = None
    portfolio:             Optional[str]   = None

    # Resume-parsed (student can also edit these manually)
    parsed_skills:  Optional[str] = None
    internships:    Optional[str] = None
    projects:       Optional[str] = None
    achievements:   Optional[str] = None


class StudentResponse(BaseModel):
    """Full profile returned to the frontend."""
    id:             Optional[int]   = None
    user_id:        Optional[int]   = None

    # Identity
    roll_no:        Optional[str]   = None
    full_name:      Optional[str]   = None
    gender:         Optional[str]   = None
    dob:            Optional[str]   = None
    nationality:    Optional[str]   = None
    phone:          Optional[str]   = None

    # Academic (locked when verified_academics=True)
    degree:         Optional[str]   = None
    department:     Optional[str]   = None
    college_name:   Optional[str]   = None
    college_state:  Optional[str]   = None
    university:     Optional[str]   = None
    grading_system: Optional[str]   = None
    year_of_passing: Optional[int]  = None
    tenth_percent:  Optional[float] = None
    twelfth_percent: Optional[float]= None
    diploma_percent: Optional[float]= None
    cgpa:           Optional[float] = None
    backlogs:       Optional[int]   = None
    verified_academics: Optional[bool] = None

    # Student-editable
    skills:                Optional[str] = None
    internship_experience: Optional[str] = None
    experience_months:     Optional[int] = None
    linkedin:              Optional[str] = None
    portfolio:             Optional[str] = None
    resume_url:            Optional[str] = None

    # Resume-parsed
    parsed_skills:  Optional[str] = None
    internships:    Optional[str] = None
    projects:       Optional[str] = None
    achievements:   Optional[str] = None

    class Config:
        from_attributes = True
