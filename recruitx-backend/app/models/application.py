from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    # 🔥 Link directly to users table
    student_id = Column(Integer, ForeignKey("users.id"))

    job_id = Column(Integer, ForeignKey("jobs.id"))

    status = Column(String(20), default="APPLIED")

    applied_at = Column(DateTime(timezone=True), server_default=func.now())