from sqlalchemy import Column, Integer, String, Enum, Boolean
from app.core.database import Base
import enum


class RoleEnum(str, enum.Enum):
    student = "student"
    placement = "placement"
    company = "company"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(100), unique=True, index=True, nullable=False)

    password = Column(String(255), nullable=False)

    role = Column(Enum(RoleEnum), nullable=False)

    # NEW FIELDS FOR INSTITUTIONAL CONTROL
    is_active = Column(Boolean, default=True)
    is_default_password = Column(Boolean, default=True)