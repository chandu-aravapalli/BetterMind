from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from pydantic import BaseModel
from app.models.assessment import (
    Assessment,
    AssessmentCreate,
    AssessmentUpdate,
    AnxietyAssessmentFormData
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

GAD7_QUESTIONS = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it's hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen"
]

router = APIRouter()

@router.post("/submit", response_model=dict)
async def submit_anxiety_assessment(
    form_data: AnxietyAssessmentFormData,
    current_user: dict = Depends(get_current_user)
):
    """Submit anxiety assessment"""
    db = get_database()
    
    # Transform form data into questions and answers format
    questions = [
        {
            "questionId": i + 1,
            "questionText": GAD7_QUESTIONS[i],
            "score": getattr(form_data, list(form_data.model_fields.keys())[i])
        }
        for i in range(7)  # GAD-7 has 7 questions
    ]
    
    # Create assessment document
    assessment_dict = {
        "userId": str(current_user["_id"]),
        "assessmentType": "anxiety",
        "status": "completed",
        "questions": questions,
        "score": form_data.totalScore,
        "severity": form_data.severity,
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
    """Get all anxiety assessments for a user"""
    if current_user["role"] != "doctor" and str(current_user["_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these assessments"
        )
    
    db = get_database()
    assessments = await db.assessments.find({
        "userId": user_id,
        "assessmentType": "anxiety"
    }).to_list(None)
    return [serialize_doc(assessment) for assessment in assessments]

@router.get("/submission/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific anxiety assessment"""
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

@router.get("/all-results", response_model=List[Dict[str, Any]])
async def get_all_assessments(current_user: dict = Depends(get_current_user)):
    """Get all anxiety assessments (doctor only)"""
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access all assessments"
        )
    
    db = get_database()
    assessments = await db.assessments.find({
        "assessmentType": "anxiety",
        "status": "completed"
    }).to_list(None)
    return [serialize_doc(assessment) for assessment in assessments] 