from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.user import User
from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/company", tags=["Company"])


#  Company Creates Job (Needs Approval)
@router.post("/create-job")
def create_job(
    title: str,
    min_cgpa: float,
    max_backlogs: int,
    department: str = None,
    skill: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Not authorized")

    job = Job(
        title=title,
        company_name=current_user.email,  # simple for now
        min_cgpa=min_cgpa,
        max_backlogs=max_backlogs,
        department=department,
        skill=skill,
        created_by=current_user.id,
        is_approved=False  #  must be approved by placement
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {"message": "Job submitted for approval"}


#  Company sees only its jobs
@router.get("/my-jobs")
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Not authorized")

    jobs = db.query(Job).filter(Job.created_by == current_user.id).all()
    return jobs