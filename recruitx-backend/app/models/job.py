from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100))
    company_name = Column(String(100))

    min_cgpa = Column(Float)
    min_tenth = Column(Float)
    min_twelfth = Column(Float)

    max_backlogs = Column(Integer)
    department = Column(String(50))
    required_skill = Column(String(100))
    year_required = Column(Integer)

    internship_required = Column(Boolean, default=False)

    created_by = Column(Integer)
    is_approved = Column(Boolean, default=False)

    external_link = Column(String(500), nullable=True)

   