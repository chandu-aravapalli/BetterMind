from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    users,
    assessments,
    notifications,
    pre_assessment,
    stress_assessment,
    anxiety_assessment,
    ptsd_assessment,
    doctor
)
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="Mental Health Assessment API",
    description="API for managing mental health assessments and user data",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["assessments"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(pre_assessment.router, prefix="/api/pre-assessment", tags=["pre-assessment"])
app.include_router(stress_assessment.router, prefix="/api/stress-assessment", tags=["stress-assessment"])
app.include_router(anxiety_assessment.router, prefix="/api/anxiety-assessment", tags=["anxiety-assessment"])
app.include_router(ptsd_assessment.router, prefix="/api/ptsd-assessment", tags=["ptsd-assessment"])
app.include_router(doctor.router, prefix="/api/doctor", tags=["doctor"])

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to Mental Health Assessment API"} 