from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.schemas.student import StudentCreate, StudentResponse
from app.models.student import StudentProfile
from app.models.job import Job
from app.models.user import User
from app.models.application import Application
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.dependencies import student_only
import shutil, os, re, json

router = APIRouter(prefix="/student", tags=["Student"])

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
# CREATE / UPDATE PROFILE  (student-editable fields only)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/profile")
def create_or_update_profile(
    data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(StudentProfile) \
        .filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400,
                            detail="Profile must be provisioned by the institution first")

    for field in ["full_name", "phone", "skills", "internship_experience",
                  "experience_months", "linkedin", "portfolio",
                  "parsed_skills", "internships", "projects", "achievements"]:
        val = getattr(data, field, None)
        if val is not None:
            setattr(profile, field, val)

    db.commit()
    return {"message": "Profile updated successfully"}


# ─────────────────────────────────────────────────────────────────────────────
# GET PROFILE
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not p:
        return None
    # Convert to dict and inject is_default_password from User table
    data = {c.name: getattr(p, c.name) for c in p.__table__.columns}
    data["is_default_password"] = current_user.is_default_password
    return data


# ─────────────────────────────────────────────────────────────────────────────
# UPLOAD RESUME (save only, no parsing)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    file_path = f"{UPLOAD_DIR}/{current_user.id}.pdf"
    with open(file_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    profile = db.query(StudentProfile) \
        .filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.resume_url = file_path
    db.commit()
    return {"message": "Resume uploaded", "path": file_path}


# ═════════════════════════════════════════════════════════════════════════════
#  RESUME PARSER ENGINE
# ═════════════════════════════════════════════════════════════════════════════

# ── Comprehensive skill keyword set ──────────────────────────────────────────
TECH_SKILLS = {
    # Languages
    "python","java","javascript","typescript","c","c++","c#","go","golang",
    "rust","kotlin","swift","ruby","php","scala","r","matlab","dart","julia",
    "perl","bash","shell","powershell","vba","cobol","fortran","assembly",
    # Web – Frontend
    "react","react.js","reactjs","vue","vue.js","vuejs","angular","angularjs",
    "next.js","nextjs","nuxt","svelte","html","html5","css","css3","sass","scss",
    "tailwind","tailwindcss","bootstrap","jquery","redux","zustand","webpack",
    "vite","gatsby","astro","three.js","d3.js","p5.js",
    # Web – Backend
    "node","node.js","nodejs","express","expressjs","django","flask","fastapi",
    "spring","spring boot","laravel","rails","ruby on rails","asp.net",".net",
    "nestjs","strapi","graphql","rest","restful","grpc","soap",
    # Databases
    "sql","mysql","postgresql","postgres","mongodb","redis","sqlite","oracle",
    "firebase","cassandra","dynamodb","elasticsearch","neo4j","mariadb",
    "supabase","mssql","sql server","bigquery","snowflake","hbase",
    # Cloud & DevOps
    "aws","azure","gcp","google cloud","docker","kubernetes","k8s","terraform",
    "ansible","jenkins","ci/cd","github actions","gitlab ci","circleci",
    "linux","nginx","apache","heroku","vercel","netlify","cloudflare",
    # AI / ML / Data
    "machine learning","deep learning","artificial intelligence","ai","ml",
    "pytorch","tensorflow","keras","scikit-learn","sklearn","numpy","pandas",
    "matplotlib","seaborn","opencv","nlp","natural language processing",
    "computer vision","transformers","langchain","llm","generative ai",
    "data science","data analysis","data engineering","hadoop","spark",
    "tableau","power bi","excel","looker","dbt","airflow","mlflow",
    # Mobile
    "android","ios","react native","flutter","xamarin","swiftui","jetpack compose",
    # Tools / Version Control
    "git","github","gitlab","bitbucket","jira","confluence","postman",
    "figma","photoshop","canva","vs code","intellij","pycharm","jupyter",
    # Concepts / Methodologies
    "microservices","agile","scrum","devops","mlops","object oriented","oop",
    "data structures","algorithms","system design","api development",
    "blockchain","cybersecurity","networking","cloud computing","mvc",
    "design patterns","tdd","bdd","solid","clean code",
}

# ── Resume section keywords (any matching keyword maps to canonical name) ────
SECTION_KEYWORDS = {
    # skills
    "technical skill": "skills",
    "skill":           "skills",
    "technology":      "skills",
    "tech stack":      "skills",
    "competenc":       "skills",
    "tools":           "skills",
    # projects
    "project":         "projects",
    # internships / experience
    "internship":      "internships",
    "experience":      "internships",
    "training":        "internships",
    "work history":    "internships",
    # achievements
    "achievement":     "achievements",
    "accomplishment":  "achievements",
    "certification":   "achievements",
    "certificate":     "achievements",
    "award":           "achievements",
    "honor":           "achievements",
    "honours":         "achievements",
    "extracurricular": "achievements",
    "extra curricular":"achievements",
    "activity":        "achievements",
    "volunteer":       "achievements",
    "publication":     "achievements",
    "leadership":      "achievements",
    "position":        "achievements",
}

# Lines that are clearly NOT content
_SKIP_RE = re.compile(
    r"^\s*(page\s*\d+|curriculum vitae|resume|cv$|references available)\s*$",
    re.IGNORECASE
)


def _classify_header(line: str) -> str | None:
    """
    Multi-strategy section header classifier.
    Returns canonical section name or None.
    """
    stripped = line.strip()
    if not stripped or len(stripped) > 60:
        return None

    # Remove leading numbers/bullets/symbols and trailing punctuation
    clean = re.sub(r"^[\d\W]+", "", stripped).strip()
    clean = re.sub(r"[:\-\u2013\u2014_]+$", "", clean).strip()
    lower = clean.lower()

    if not lower or len(lower) < 3:
        return None

    # Strategy 1: all-uppercase line (common in modern resumes)
    # e.g. "PROJECTS" or "TECHNICAL SKILLS"
    words = stripped.split()
    if len(words) <= 5 and all(w.isupper() or not w.isalpha() for w in words if w):
        for kw, section in SECTION_KEYWORDS.items():
            if kw in lower:
                return section

    # Strategy 2: exact or substring match in SECTION_KEYWORDS
    for kw, section in SECTION_KEYWORDS.items():
        if kw in lower:
            # Extra guard: must be a short line (not a sentence)
            if len(lower.split()) <= 6:
                return section

    return None


def _split_into_sections(text: str) -> dict:
    """Walk every line, group under detected section headers."""
    sections: dict[str, list] = {}
    current: str | None = None

    for raw_line in text.splitlines():
        header = _classify_header(raw_line)
        if header:
            current = header
            sections.setdefault(current, [])
        elif current and not _SKIP_RE.match(raw_line):
            sections[current].append(raw_line)

    return sections



def _extract_text(path: str) -> str:
    """Extract text from PDF using pdfplumber, fall back to PyPDF2."""
    try:
        import pdfplumber
        with pdfplumber.open(path) as pdf:
            pages = []
            for page in pdf.pages:
                t = page.extract_text(x_tolerance=2, y_tolerance=2)
                if t:
                    pages.append(t)
            return "\n".join(pages)
    except Exception:
        pass
    try:
        import PyPDF2
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            return "\n".join(p.extract_text() or "" for p in reader.pages)
    except Exception:
        return ""


def _clean_lines(lines: list[str]) -> list[str]:
    """Strip, deduplicate blanks, remove page artefacts."""
    out = []
    prev_blank = False
    for l in lines:
        s = l.strip()
        if not s:
            if not prev_blank:
                out.append("")
            prev_blank = True
        else:
            out.append(s)
            prev_blank = False
    return out


def _split_items(lines: list[str]) -> list[dict]:
    """
    Split a resume section into individual items (projects / internships / achievements).

    Handles THREE real-world PDF formats:

    Format A – inline bullets (most common, your case):
        "EduVision AI – AI Video Assistant • Extracted transcripts • Used Gemini..."
        "Virtual Herbal Garden • Built 3D library • Integrated MongoDB..."
        → Split each line by • ; pre-bullet text = title, rest = description

    Format B – line-starting bullets:
        EduVision AI (title line)
        • Extracted transcripts...
        • Used Gemini...
        Virtual Herbal Garden (new title, appears after bullet lines)

    Format C – blank-line-separated:
        EduVision AI
        Extracted transcripts...
        <blank>
        Virtual Herbal Garden
        Built 3D library...
    """
    # All known bullet characters (Unicode + ASCII)
    INLINE_BULLETS = "•▪▸▶◆◇●○◉➤➢✓✔►"
    LINE_BULLET_RE = re.compile(r"^[\s]*[•\-\*▪◦➢➤✓✔»›◆○●]\s+")

    items: list[dict] = []
    cur_title = ""
    cur_desc_parts: list[str] = []

    def _flush():
        nonlocal cur_title, cur_desc_parts
        t = cur_title.strip()
        d = " ".join(p.strip() for p in cur_desc_parts if p.strip())
        if t or d:
            items.append({"title": t or d[:100], "description": d if t else ""})
        cur_title = ""
        cur_desc_parts = []

    def _has_inline_bullets(line: str) -> bool:
        """True if the line has bullet chars NOT at the very start."""
        stripped = line.strip()
        if not stripped:
            return False
        # Has bullet somewhere after position 0
        for ch in INLINE_BULLETS:
            if ch in stripped[1:]:
                return True
        return False

    for raw in lines:
        line = raw.strip()
        if not line:
            _flush()
            continue

        if LINE_BULLET_RE.match(raw):
            # ── FORMAT B: line starts with a bullet ──────────────────────
            cur_desc_parts.append(
                re.sub(r"^[\s]*[•\-\*▪◦➢➤✓✔»›◆○●]\s+", "", line)
            )

        elif _has_inline_bullets(line):
            # ── FORMAT A: inline bullets within the line ──────────────────
            # Split by any of the bullet chars
            parts = re.split(r"[•▪▸▶◆◇●○◉➤➢✓✔►]+", line)
            parts = [p.strip() for p in parts if p.strip()]

            if not parts:
                continue

            pre_bullet = parts[0]   # text BEFORE the first bullet = title
            desc_parts = parts[1:]  # rest = description points

            # Check if pre_bullet is a genuine title (not an empty string
            # or just punctuation)
            if pre_bullet and len(pre_bullet) > 2:
                # Save current item and start a new one
                _flush()
                cur_title = pre_bullet
                cur_desc_parts = desc_parts
            else:
                # Line started with a bullet (pre_bullet was empty/short)
                cur_desc_parts.extend(desc_parts)

        else:
            # ── FORMAT C / hybrid: plain non-bullet line ──────────────────
            if not cur_title:
                cur_title = line
            else:
                # If we already have description content, this new non-bullet
                # line is likely a new project title
                if cur_desc_parts:
                    _flush()
                    cur_title = line
                else:
                    # Still in title area – append as subtitle/date
                    cur_title += " | " + line

    _flush()
    return items



def _extract_skills_from_text(full_text: str, skill_lines: list[str]) -> str:
    """
    Two-pass skill extraction:
    1. Extract ALL reasonable tokens from the dedicated skills section
       (captures custom skills not in TECH_SKILLS)
    2. Keyword-match the entire document for well-known tech skills
    """
    found: set[str] = set()

    # PASS 1 — raw extraction from Skills section lines
    skills_raw = " ".join(skill_lines)
    # Split on common delimiter patterns
    raw_tokens = re.split(r"[,;|/\n\t•\u2022\u25aa\u25ab]+", skills_raw)
    for tok in raw_tokens:
        tok = tok.strip().strip('"\(\)\.:')
        # Accept tokens that are 2-40 chars and not pure numbers
        if 2 <= len(tok) <= 40 and not tok.isdigit():
            found.add(tok)  # keep original casing from the resume

    # PASS 2 — keyword scan the full document (lowercase normalised)
    all_lower = full_text.lower()
    word_list = re.split(r"\s+", all_lower)

    # Single words
    for w in set(word_list):
        if w in TECH_SKILLS:
            found.add(w.title() if len(w) > 2 else w.upper())

    # Bigrams
    for i in range(len(word_list) - 1):
        bg = f"{word_list[i]} {word_list[i+1]}"
        if bg in TECH_SKILLS:
            found.add(bg.title())

    # Trigrams
    for i in range(len(word_list) - 2):
        tg = f"{word_list[i]} {word_list[i+1]} {word_list[i+2]}"
        if tg in TECH_SKILLS:
            found.add(tg.title())

    # Sort, deduplicate case-insensitively
    seen_lower: set[str] = set()
    deduped: list[str] = []
    for sk in sorted(found, key=str.casefold):
        sl = sk.casefold()
        if sl not in seen_lower:
            seen_lower.add(sl)
            deduped.append(sk)

    return ", ".join(deduped)



def _format_project_item(item_text: str) -> str:
    """
    Nicely format a project block. The first line is treated as the title,
    the rest as description.
    """
    lines = [l.strip() for l in item_text.splitlines() if l.strip()]
    if not lines:
        return ""
    # Already a single merged blob → just return cleaned
    return item_text.strip()


def _section_to_text(lines: list[str]) -> str:
    """
    Convert raw section lines into clean readable text.
    Inline bullet characters (•) become newline + bullet for readability.
    """
    out_lines = []
    for raw in lines:
        line = raw.strip()
        if not line:
            out_lines.append("")          # preserve paragraph break
            continue
        # If line has inline bullets, split them onto separate lines
        if "•" in line[1:]:              # bullet not at start = inline
            parts = line.split("•")
            out_lines.append(parts[0].strip())   # title / header
            for p in parts[1:]:
                p = p.strip()
                if p:
                    out_lines.append("• " + p)
        else:
            out_lines.append(line)

    # Collapse multiple consecutive blank lines into one
    result, prev_blank = [], False
    for l in out_lines:
        if l == "":
            if not prev_blank:
                result.append("")
            prev_blank = True
        else:
            result.append(l)
            prev_blank = False

    return "\n".join(result).strip()


def _parse_resume(text: str) -> dict:
    """
    Parse resume text. Stores:
      - parsed_skills  : comma-separated skill string
      - projects       : raw formatted text of the projects section
      - internships    : raw formatted text of the internships section
      - achievements   : raw formatted text of the achievements section
    """
    sections = _split_into_sections(text)

    # Skills — still use keyword extraction
    skill_lines   = sections.get("skills", [])
    parsed_skills = _extract_skills_from_text(text, skill_lines)

    # Everything else — just clean raw text
    projects     = _section_to_text(sections.get("projects",     []))
    internships  = _section_to_text(sections.get("internships",  []))
    achievements = _section_to_text(sections.get("achievements", []))

    return {
        "parsed_skills": parsed_skills,
        "projects":      projects,
        "internships":   internships,
        "achievements":  achievements,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PARSE RESUME  — upload + extract everything
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/parse-resume")
def parse_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_path = f"{UPLOAD_DIR}/{current_user.id}.pdf"
    with open(file_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    text = _extract_text(file_path)
    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from PDF. Make sure the resume is not a scanned image."
        )

    parsed = _parse_resume(text)

    profile = db.query(StudentProfile) \
        .filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.resume_url    = file_path
    profile.parsed_skills = parsed["parsed_skills"]
    profile.projects      = parsed["projects"]
    profile.internships   = parsed["internships"]
    profile.achievements  = parsed["achievements"]
    db.commit()

    return {
        "message":       "Resume parsed successfully",
        "parsed_skills": parsed["parsed_skills"],
        "projects":      parsed["projects"],
        "internships":   parsed["internships"],
        "achievements":  parsed["achievements"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# ELIGIBLE JOBS  (with match scoring)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/eligible-jobs")
def get_all_jobs_with_eligibility(
    db: Session = Depends(get_db),
    user=Depends(student_only)
):
    student = db.query(StudentProfile) \
        .filter(StudentProfile.user_id == user["sub"]).first()
    if not student:
        return []

    jobs   = db.query(Job).filter(Job.is_approved == True).all()
    result = []

    for job in jobs:
        eligible = True
        reason   = None

        if job.min_cgpa and (student.cgpa or 0) < job.min_cgpa:
            eligible, reason = False, "Minimum CGPA not met"
        elif job.min_tenth and (student.tenth_percent or 0) < job.min_tenth:
            eligible, reason = False, "Minimum 10th percentage not met"
        elif job.min_twelfth and (student.twelfth_percent or 0) < job.min_twelfth:
            eligible, reason = False, "Minimum 12th percentage not met"
        elif job.max_backlogs is not None and (student.backlogs or 0) > job.max_backlogs:
            eligible, reason = False, "Too many backlogs"

        all_skills = ",".join(filter(None, [student.skills, student.parsed_skills]))
        skill_match_percent = 0
        if job.required_skill and all_skills:
            job_skills     = {s.strip().lower() for s in job.required_skill.split(",")}
            student_skills = {s.strip().lower() for s in all_skills.split(",")}
            inter = job_skills & student_skills
            if job_skills:
                skill_match_percent = len(inter) / len(job_skills) * 100

        score = 0
        if job.min_cgpa   and student.cgpa:          score += min(student.cgpa          / job.min_cgpa,   1) * 30
        if job.min_tenth  and student.tenth_percent:  score += min(student.tenth_percent / job.min_tenth,  1) * 15
        if job.min_twelfth and student.twelfth_percent: score += min(student.twelfth_percent / job.min_twelfth, 1) * 15
        score += (skill_match_percent / 100) * 20
        if job.internship_required and student.internship_experience == "YES": score += 10
        if (student.backlogs or 0) == 0: score += 10

        result.append({
            "id":                  job.id,
            "title":               job.title,
            "company_name":        job.company_name,
            "eligible":            eligible,
            "reason":              reason,
            "match_score":         round(score, 2),
            "skill_match_percent": round(skill_match_percent, 2),
            "external_link":       job.external_link,
        })
    return result


# ─────────────────────────────────────────────────────────────────────────────
# APPLY TO JOB
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/apply/{job_id}")
def apply_job(job_id: int, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    existing = db.query(Application).filter(
        Application.student_id == current_user.id,
        Application.job_id     == job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    db.add(Application(student_id=current_user.id, job_id=job_id))
    db.commit()
    return {"message": "Applied successfully"}


# ─────────────────────────────────────────────────────────────────────────────
# GET APPLIED JOB IDs
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/applied-jobs")
def get_applied_jobs(db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    return [a.job_id for a in db.query(Application)
            .filter(Application.student_id == current_user.id).all()]


# ─────────────────────────────────────────────────────────────────────────────
# MY APPLICATIONS — full detail for student dashboard tab
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/my-applications")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    applications = db.query(Application).filter(
        Application.student_id == current_user.id
    ).order_by(Application.applied_at.desc()).all()

    result = []
    for app in applications:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        if not job:
            continue
        result.append({
            "application_id": app.id,
            "job_id":         job.id,
            "job_title":      job.title,
            "company_name":   job.company_name,
            "department":     job.department,
            "status":         app.status,
            "applied_at":     app.applied_at.strftime("%d %b %Y") if app.applied_at else "",
            "external_link":  job.external_link or "",
            "is_approved":    job.is_approved,
        })
    return result


# ─────────────────────────────────────────────────────────────────────────────
# CHANGE PASSWORD
# ─────────────────────────────────────────────────────────────────────────────
from pydantic import BaseModel as PydanticBase
from app.core.security import verify_password, hash_password as _hash_pw

class ChangePasswordRequest(PydanticBase):
    old_password: str
    new_password: str

@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(payload.old_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.password = _hash_pw(payload.new_password)
    current_user.is_default_password = False
    db.commit()
    return {"message": "Password changed successfully"}



# ─────────────────────────────────────────────────────────────────────────────
# MY APPLICATIONS — full detail for student dashboard tab
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/my-applications")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    applications = db.query(Application).filter(
        Application.student_id == current_user.id
    ).order_by(Application.applied_at.desc()).all()

    result = []
    for app in applications:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        if not job:
            continue
        result.append({
            "application_id": app.id,
            "job_id":         job.id,
            "job_title":      job.title,
            "company_name":   job.company_name,
            "department":     job.department,
            "status":         app.status,
            "applied_at":     app.applied_at.strftime("%d %b %Y") if app.applied_at else "",
            "external_link":  job.external_link or "",
            "is_approved":    job.is_approved,
        })
    return result
