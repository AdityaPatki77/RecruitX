from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.application import Application
from app.core.database import get_db
from app.core.dependencies import student_only

router = APIRouter(prefix="/application", tags=["Application"])

@router.post("/apply/{job_id}")
def apply_job(
    job_id: int,
    db: Session = Depends(get_db),
    user=Depends(student_only)
):
    app = Application(
        student_id=user["sub"],
        job_id=job_id
    )
    db.add(app)
    db.commit()
    return {"message": "Applied successfully"}
