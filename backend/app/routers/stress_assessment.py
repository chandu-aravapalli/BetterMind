from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from pydantic import BaseModel
from app.models.assessment import (
    Assessment,
    AssessmentCreate,
    AssessmentUpdate,
    StressAssessmentFormData
)
from app.db.mongodb import get_database
from app.core.auth import get_current_user
from bson import ObjectId
from datetime import datetime

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to serializable dictionary"""
    if doc is None:
        return None
    
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, dict):
            doc[key] = serialize_doc(value)
        elif isinstance(value, list):
            doc[key] = [serialize_doc(item) if isinstance(item, dict) else str(item) if isinstance(item, ObjectId) else item for item in value]
    return doc

class AssessmentQuestion(BaseModel):
    questionId: int
    questionText: str
    score: int

class StressAssessmentData(BaseModel):
    userId: str
    questions: List[AssessmentQuestion]
    totalScore: int
    assessmentType: str

router = APIRouter()

@router.post("/submit", response_model=dict)
async def submit_stress_assessment(
    assessment_data: StressAssessmentData,
    current_user: dict = Depends(get_current_user)
):
    """Submit stress assessment with questions and answers"""
    db = get_database()
    
    # Verify user
    if str(current_user["_id"]) != assessment_data.userId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to submit assessment for this user"
        )
    
    # Create assessment document
    assessment_dict = {
        "userId": assessment_data.userId,
        "assessmentType": assessment_data.assessmentType,
        "status": "completed",
        "questions": [q.dict() for q in assessment_data.questions],
        "score": assessment_data.totalScore,
        "severity": determine_severity(assessment_data.totalScore),
        "startedAt": datetime.utcnow(),
        "completedAt": datetime.utcnow()
    }
    
    result = await db.assessments.insert_one(assessment_dict)
    
    if (created_assessment := await db.assessments.find_one({"_id": result.inserted_id})) is not None:
        return serialize_doc(created_assessment)
    
    raise HTTPException(status_code=500, detail="Failed to create assessment")

@router.get("/submissions/{user_id}", response_model=List[Dict[str, Any]])
async def get_user_assessments(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all stress assessments for a user"""
    # Allow doctors to view any patient's assessments or users to view their own
    if current_user["role"] != "doctor" and str(current_user["_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these assessments"
        )
    
    db = get_database()
    assessments = await db.assessments.find({
        "userId": user_id,
        "assessmentType": "stress"
    }).to_list(None)
    return [serialize_doc(assessment) for assessment in assessments]

@router.get("/submission/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific stress assessment"""
    db = get_database()
    
    assessment = await db.assessments.find_one({"_id": ObjectId(assessment_id)})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Only allow doctors or the assessment owner to view
    if current_user["role"] != "doctor" and assessment["userId"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this assessment"
        )
    
    return serialize_doc(assessment)

def calculate_stress_score(responses: dict) -> float:
    """Calculate stress score based on responses, following PHQ-9 format (0-3 scale per question)"""
    score = 0
    
    # Score physical symptoms (0-3 based on count)
    physical_count = len(responses.get("physicalSymptoms", []))
    if physical_count >= 6: score += 3
    elif physical_count >= 4: score += 2
    elif physical_count >= 2: score += 1

    # Score emotional symptoms (0-3 based on count)
    emotional_count = len(responses.get("emotionalSymptoms", []))
    if emotional_count >= 6: score += 3
    elif emotional_count >= 4: score += 2
    elif emotional_count >= 2: score += 1

    # Score behavioral symptoms (0-3 based on count)
    behavioral_count = len(responses.get("behavioralSymptoms", []))
    if behavioral_count >= 6: score += 3
    elif behavioral_count >= 4: score += 2
    elif behavioral_count >= 2: score += 1

    # Score stress level directly (already on 0-10 scale, convert to 0-3)
    stress_level = responses.get("stressLevel", 0)
    score += min(3, round(stress_level / 3.33))  # Convert 0-10 to 0-3

    # Score stress triggers (0-3 based on count)
    triggers_count = len(responses.get("stressTriggers", []))
    if triggers_count >= 6: score += 3
    elif triggers_count >= 4: score += 2
    elif triggers_count >= 2: score += 1

    # Score protective factors (reverse scoring)
    for factor in ["sleepQuality", "exerciseFrequency", "dietQuality", "socialSupport", "workLifeBalance"]:
        value = responses.get(factor, 3)  # Default to middle value if not provided
        # Convert 0-5 scale to 0-3 reverse score
        score += 3 - min(3, round(value / 1.67))  # Convert 0-5 to 0-3 and reverse

    # Final score will be between 0-27 (9 categories * max score of 3)
    return min(27, max(0, score))

def determine_severity(score: float) -> str:
    """Determine stress severity based on PHQ-9 scale"""
    if score <= 4:
        return "minimal"
    elif score <= 9:
        return "mild"
    elif score <= 14:
        return "moderate"
    elif score <= 19:
        return "moderately severe"
    else:
        return "severe"

@router.get("/all-results", response_model=List[Dict[str, Any]])
async def get_all_assessments(current_user: dict = Depends(get_current_user)):
    """Get all stress assessments (doctor only)"""
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access all assessments"
        )
    
    db = get_database()
    assessments = await db.assessments.find({
        "assessmentType": "stress",
        "status": "completed"
    }).to_list(None)
    return [serialize_doc(assessment) for assessment in assessments] 