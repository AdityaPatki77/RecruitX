from fastapi import FastAPI
from app.core.database import Base, engine
from app.routers import auth, student, placement
from app.routers import company, application
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RecruitX Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(student.router)
app.include_router(placement.router)   # 🔥 THIS WAS MISSING
app.include_router(company.router)
app.include_router(application.router)