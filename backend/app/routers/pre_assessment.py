from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.models.assessment import (
    Question,
    QuestionCreate,
    Assessment,
    AssessmentCreate,
    PreAssessmentFormData,
    DEFAULT_QUESTIONS
)
from app.db.mongodb import get_database
from app.core.auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/questions", response_model=List[Question])
async def get_pre_assessment_questions():
    """Get all pre-assessment questions"""
    db = get_database()
    questions = await db.pre_assessment_questions.find().to_list(None)
    
    # If no questions exist, create default questions
    if not questions:
        for question in DEFAULT_QUESTIONS:
            await db.pre_assessment_questions.insert_one(question)
        questions = await db.pre_assessment_questions.find().to_list(None)
    
    return questions

@router.post("/submit", response_model=Assessment)
async def submit_pre_assessment(
    form_data: PreAssessmentFormData,
    current_user: dict = Depends(get_current_user)
):
    """Submit pre-assessment form"""
    db = get_database()
    
    # Validate consent
    if form_data.consent.lower() != "yes":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent is required to submit the assessment"
        )
    
    # Create assessment document
    assessment_dict = {
        "userId": str(current_user["_id"]),
        "assessmentType": "pre",
        "status": "completed",
        "responses": form_data.model_dump(),
        "startedAt": datetime.utcnow(),
        "completedAt": datetime.utcnow()
    }
    
    result = await db.assessments.insert_one(assessment_dict)
    
    if (created_assessment := await db.assessments.find_one({"_id": result.inserted_id})) is not None:
        return created_assessment
    
    raise HTTPException(status_code=500, detail="Failed to create assessment")

@router.get("/submissions/{user_id}", response_model=List[Assessment])
async def get_user_submissions(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all pre-assessment submissions for a user"""
    # Allow doctors to view any patient's submissions or users to view their own
    if current_user["role"] != "doctor" and str(current_user["_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these submissions"
        )
    
    db = get_database()
    submissions = await db.assessments.find({
        "userId": user_id,
        "assessmentType": "pre"
    }).to_list(None)
    return submissions

@router.get("/submission/{submission_id}", response_model=Assessment)
async def get_submission(
    submission_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific pre-assessment submission"""
    db = get_database()
    
    submission = await db.assessments.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Only allow doctors or the submission owner to view
    if current_user["role"] != "doctor" and submission["userId"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this submission"
        )
    
    return submission 