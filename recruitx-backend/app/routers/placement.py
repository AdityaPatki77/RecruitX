from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse
from app.core.dependencies import placement_only
from app.models.application import Application
from app.models.student import StudentProfile
from app.models.user import User, RoleEnum
from app.core.security import hash_password

import pandas as pd
import io

router = APIRouter(prefix="/placement", tags=["Placement"])


# ──────────────────────────────────────────────────────────────────
# CREATE JOB
# ──────────────────────────────────────────────────────────────────
@router.post("/create-job", response_model=JobResponse)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    user=Depends(placement_only)
):
    new_job = Job(
        title=job.title,
        company_name=job.company_name,
        min_cgpa=job.min_cgpa,
        min_tenth=job.min_tenth,
        min_twelfth=job.min_twelfth,
        max_backlogs=job.max_backlogs,
        department=job.department,
        required_skill=job.required_skill,
        year_required=job.year_required,
        internship_required=job.internship_required,
        external_link=job.external_link,
        created_by=user["sub"],
        is_approved=True
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


# ──────────────────────────────────────────────────────────────────
# GET ALL JOBS
# ──────────────────────────────────────────────────────────────────
@router.get("/all-jobs")
def get_all_jobs(db: Session = Depends(get_db), user=Depends(placement_only)):
    return db.query(Job).all()


# ──────────────────────────────────────────────────────────────────
# APPROVE JOB
# ──────────────────────────────────────────────────────────────────
@router.put("/approve-job/{job_id}")
def approve_job(job_id: int, db: Session = Depends(get_db), user=Depends(placement_only)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.is_approved:
        raise HTTPException(status_code=400, detail="Already approved")
    job.is_approved = True
    db.commit()
    return {"message": "Job approved successfully"}


# ──────────────────────────────────────────────────────────────────
# GET JOB APPLICANTS (AUTO SCORING)
# ──────────────────────────────────────────────────────────────────
@router.get("/job-applicants/{job_id}")
def get_job_applicants(job_id: int, db: Session = Depends(get_db), user=Depends(placement_only)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    applications = db.query(Application).filter(Application.job_id == job_id).all()
    result = []

    for app in applications:
        student = db.query(StudentProfile).filter(
            StudentProfile.user_id == app.student_id
        ).first()
        if not student:
            continue

        skill_match_percent = 0
        if job.required_skill and student.skills:
            job_skills     = set(s.strip().lower() for s in job.required_skill.split(","))
            student_skills = set(s.strip().lower() for s in student.skills.split(","))
            inter = job_skills & student_skills
            if job_skills:
                skill_match_percent = (len(inter) / len(job_skills)) * 100

        score = 0
        if job.min_cgpa and student.cgpa:
            score += min(student.cgpa / job.min_cgpa, 1) * 30
        if job.min_tenth and student.tenth_percent:
            score += min(student.tenth_percent / job.min_tenth, 1) * 15
        if job.min_twelfth and student.twelfth_percent:
            score += min(student.twelfth_percent / job.min_twelfth, 1) * 15
        score += (skill_match_percent / 100) * 20
        if job.internship_required and student.internship_experience == "YES":
            score += 10
        if (student.backlogs or 0) == 0:
            score += 10

        score = round(score, 2)

        if app.status == "APPLIED":
            if score >= 75:
                app.status = "SHORTLISTED"
            elif score < 50:
                app.status = "REJECTED"

        result.append({
            "application_id":      app.id,
            "full_name":           student.full_name,
            "roll_no":             student.roll_no,
            "department":          student.department,
            "cgpa":                student.cgpa,
            "resume_url":          student.resume_url,
            "status":              app.status,
            "match_score":         score,
            "skill_match_percent": round(skill_match_percent, 2),
        })

    db.commit()
    result.sort(key=lambda x: x["match_score"], reverse=True)
    return result


# ──────────────────────────────────────────────────────────────────
# UPDATE APPLICATION STATUS
# ──────────────────────────────────────────────────────────────────
@router.put("/update-application/{application_id}")
def update_application_status(
    application_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(placement_only)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = status
    db.commit()
    return {"message": "Status updated"}


# ──────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────
def _safe_float(val, default=None):
    try:
        s = str(val).strip().upper()
        if s in ("NA", "N/A", "NONE", "NAN", ""):
            return default
        return float(val)
    except (ValueError, TypeError):
        return default


def _safe_int(val, default=0):
    try:
        s = str(val).strip().upper()
        if s in ("NA", "N/A", "NONE", "NAN", ""):
            return default
        return int(float(val))
    except (ValueError, TypeError):
        return default


def _safe_str(val, default=None):
    s = str(val).strip()
    if s.upper() in ("NA", "N/A", "NONE", "NAN", ""):
        return default
    return s


# ──────────────────────────────────────────────────────────────────
# UPLOAD STUDENT MASTER SHEET  (WIPE + RECREATE)
# ──────────────────────────────────────────────────────────────────
@router.post("/upload-student-master-sheet")
def upload_student_master_sheet(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(placement_only)
):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx Excel files are allowed")

    # Read entire file into memory first so we can parse it safely
    try:
        contents = file.file.read()
        df = pd.read_excel(io.BytesIO(contents), dtype=str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse Excel: {e}")

    print(f"[SYNC] Excel loaded — {len(df)} rows found.")
    cols = list(df.columns)
    print(f"[SYNC] Columns: {cols}")

    # ── Fuzzy column finder ────────────────────────────────────────
    # Finds the first column whose name contains ALL of the given keywords (case-insensitive)
    def _col(keywords, row):
        kws = [k.lower() for k in keywords]
        for c in cols:
            cl = c.lower()
            if all(k in cl for k in kws):
                return row.get(c, "")
        return ""

    # ── Wipe existing student data ─────────────────────────────────
    print("[SYNC] Wiping old student data…")
    db.query(Application).delete()
    db.query(StudentProfile).delete()
    db.query(User).filter(User.role == RoleEnum.student).delete()
    db.commit()
    print("[SYNC] Wipe complete. Inserting new data…")

    created = 0
    skipped = 0
    errors  = []

    for idx, row in df.iterrows():
        email = _safe_str(
            row.get("Primary Email ID (College Specific Email ID/Domian Not Applicable)", ""),
            ""
        )
        if not email:
            skipped += 1
            continue
        email = email.strip().lower()

        roll_no = _safe_str(row.get("University Roll No", ""), "")

        try:
            user_obj = User(
                email=email,
                password=hash_password("1234"),
                role=RoleEnum.student,
                is_active=True,
                is_default_password=True,
            )
            db.add(user_obj)
            db.flush()  # resolve user_obj.id before inserting profile

            profile = StudentProfile(
                user_id         = user_obj.id,
                roll_no         = _safe_str(_col(["roll", "no"], row)) or _safe_str(_col(["roll"], row)),
                full_name       = _safe_str(_col(["full", "name"], row)),
                gender          = _safe_str(_col(["gender"], row)),
                dob             = _safe_str(_col(["dob"], row)),
                nationality     = _safe_str(_col(["nationality"], row), "Indian"),
                phone           = _safe_str(_col(["mobile"], row)) or _safe_str(_col(["phone"], row)),
                degree          = _safe_str(_col(["current", "degree", "be"], row))
                                  or _safe_str(_col(["current", "degree"], row)),
                department      = _safe_str(_col(["branch"], row)),
                college_name    = _safe_str(_col(["college", "name"], row)),
                college_state   = _safe_str(_col(["college", "state"], row)),
                university      = _safe_str(_col(["parent", "institute"], row)),
                grading_system  = _safe_str(_col(["grading"], row)),
                year_of_passing = _safe_int(_col(["yop"], row) or _col(["year", "passing"], row)),
                # ── Academic percentages – try both exact and fuzzy ──
                tenth_percent   = _safe_float(_col(["10th", "%"], row))
                                  or _safe_float(_col(["10th"], row))
                                  or _safe_float(_col(["ssc"], row))
                                  or _safe_float(_col(["x "], row)),
                twelfth_percent = _safe_float(_col(["12th", "%"], row))
                                  or _safe_float(_col(["12th"], row))
                                  or _safe_float(_col(["hsc"], row))
                                  or _safe_float(_col(["xii"], row)),
                diploma_percent = _safe_float(_col(["diploma"], row)),
                cgpa            = _safe_float(_col(["cgpa"], row))
                                  or _safe_float(_col(["current", "aggregate"], row))
                                  or _safe_float(_col(["degree", "aggregate"], row)),
                backlogs        = _safe_int(_col(["arrear"], row) or _col(["backlog"], row)),
                verified_academics = True,
            )
            db.add(profile)
            created += 1

            if created % 100 == 0:
                print(f"[SYNC] {created} students inserted…")

        except Exception as e:
            # NOTE: Do NOT call db.rollback() here — that destroys the whole session.
            # Skip the bad row, record the error, keep going.
            errors.append(f"Row {idx + 2} ({email}): {str(e)}")

    db.commit()
    print(f"[SYNC] Done! {created} created, {skipped} skipped, {len(errors)} errors.")

    return {
        "message":                "Student master sheet uploaded successfully",
        "total_students_created": created,
        "rows_skipped":           skipped,
        "errors":                 errors[:10],
        "default_password":       "1234",
    }