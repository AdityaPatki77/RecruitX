from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.user import User
from app.core.database import get_db
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/company", tags=["Company"])

class JobCreate(BaseModel):
    title: str
    min_cgpa: float
    max_backlogs: int
    department: str = None
    skill: str = None
    external_link: str = None

#  Company Creates Job (Needs Approval)
@router.post("/create-job")
def create_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Not authorized")

    job = Job(
        title=payload.title,
        company_name=current_user.email,  # simple for now
        min_cgpa=payload.min_cgpa,
        max_backlogs=payload.max_backlogs,
        department=payload.department,
        required_skill=payload.skill,
        external_link=payload.external_link,
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


#  Company Edits Job
@router.put("/update-job/{job_id}")
def update_job(
    job_id: int,
    payload: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Not authorized")

    job = db.query(Job).filter(Job.id == job_id, Job.created_by == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    job.title          = payload.title
    job.min_cgpa       = payload.min_cgpa
    job.max_backlogs   = payload.max_backlogs
    job.department     = payload.department
    job.required_skill = payload.skill
    job.external_link  = payload.external_link
    job.is_approved    = False  # re-submit for approval after edit

    db.commit()
    return {"message": "Job updated and re-submitted for approval"}


#  Company Deletes Job
@router.delete("/delete-job/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Not authorized")

    job = db.query(Job).filter(Job.id == job_id, Job.created_by == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}
