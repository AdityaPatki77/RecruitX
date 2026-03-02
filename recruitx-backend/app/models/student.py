from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey
from app.core.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    # ── Spreadsheet-synced identity fields ────────────────────────
    roll_no          = Column(String(50))
    full_name        = Column(String(150))
    gender           = Column(String(20))
    dob              = Column(String(20))        # stored as string DD-MM-YYYY
    nationality      = Column(String(50))
    phone            = Column(String(20))

    # ── Spreadsheet-synced academic fields ────────────────────────
    degree           = Column(String(50))        # BE / B.Tech / MCA …
    department       = Column(String(100))       # Branch / Stream
    college_name     = Column(String(200))
    college_state    = Column(String(100))
    university       = Column(String(200))
    grading_system   = Column(String(30))        # CGPA / Percentage
    year_of_passing  = Column(Integer)

    tenth_percent    = Column(Float)
    twelfth_percent  = Column(Float)
    diploma_percent  = Column(Float)             # optional

    cgpa             = Column(Float)
    backlogs         = Column(Integer, default=0)

    # ── Lock flag — set True when synced from official sheet ──────
    verified_academics = Column(Boolean, default=False)

    # ── Student-editable fields ───────────────────────────────────
    skills           = Column(String(500))
    internship_experience = Column(String(10), default="NO")   # YES / NO
    experience_months     = Column(Integer, default=0)

    linkedin         = Column(String(255))
    portfolio        = Column(String(255))
    resume_url       = Column(String(255))

    # ── Resume-parsed fields (auto-filled, still editable) ────────
    parsed_skills    = Column(Text)       # comma-separated
    internships      = Column(Text)       # free-text block
    projects         = Column(Text)       # free-text block
    achievements     = Column(Text)       # free-text block