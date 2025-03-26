from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from pydantic import BaseModel
from app.models.assessment import (
    Assessment,
    AssessmentCreate,
    AssessmentUpdate,
    PTSDAssessmentFormData
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

PTSD_QUESTIONS = [
    # Criterion B: Re-experiencing
    "Having repeated, disturbing memories of the stressful experience",
    "Having repeated, disturbing dreams of the stressful experience",
    "Suddenly feeling or acting as if the stressful experience were happening again",
    "Feeling very upset when something reminded you of the stressful experience",
    "Having strong physical reactions when something reminded you of the stressful experience",
    
    # Criterion C: Avoidance
    "Avoiding memories, thoughts, or feelings related to the stressful experience",
    "Avoiding external reminders of the stressful experience",
    
    # Criterion D: Negative alterations in cognition and mood
    "Trouble remembering important parts of the stressful experience",
    "Having strong negative beliefs about yourself, other people, or the world",
    "Blaming yourself or someone else for the stressful experience",
    "Having strong negative feelings such as fear, horror, anger, guilt, or shame",
    "Loss of interest in activities you used to enjoy",
    "Feeling distant or cut off from other people",
    "Having trouble experiencing positive feelings",
    
    # Criterion E: Alterations in arousal and reactivity
    "Feeling irritable or having angry outbursts",
    "Taking too many risks or doing things that could cause you harm",
    "Being overly alert or watchful for danger",
    "Being jumpy or easily startled",
    "Having difficulty concentrating",
    "Having trouble falling or staying asleep"
]

router = APIRouter()

@router.post("/submit", response_model=dict)
async def submit_ptsd_assessment(
    form_data: PTSDAssessmentFormData,
    current_user: dict = Depends(get_current_user)
):
    """Submit PTSD assessment"""
    db = get_database()
    
    # Transform form data into questions and answers format
    field_names = [
        'repeatedMemories', 'disturbingDreams', 'relivingExperience', 'upsetByReminders', 'physicalReactions',
        'avoidMemories', 'avoidExternalReminders',
        'troubleRemembering', 'negativeBeliefs', 'blamingSelfOrOthers', 'negativeFeelings', 'lossOfInterest',
        'feelingDistant', 'troublePositiveFeelings',
        'irritableOrAngry', 'recklessBehavior', 'hypervigilance', 'easilyStartled', 'difficultyConcentrating',
        'troubleSleeping'
    ]
    
    questions = [
        {
            "questionId": i + 1,
            "questionText": PTSD_QUESTIONS[i],
            "score": getattr(form_data, field_names[i])
        }
        for i in range(len(PTSD_QUESTIONS))
    ]
    
    # Create assessment document
    assessment_dict = {
        "userId": str(current_user["_id"]),
        "assessmentType": "ptsd",
        "status": "completed",
        "questions": questions,
        "score": form_data.totalScore,
        "severity": form_data.severity,
        "criteriaB": form_data.criteriaB,
        "criteriaC": form_data.criteriaC,
        "criteriaD": form_data.criteriaD,
        "criteriaE": form_data.criteriaE,
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
    """Get all PTSD assessments for a user"""
    if current_user["role"] != "doctor" and str(current_user["_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these assessments"
        )
    
    db = get_database()
    assessments = await db.assessments.find({
        "userId": user_id,
        "assessmentType": "ptsd"
    }).to_list(None)
    return [serialize_doc(assessment) for assessment in assessments]

@router.get("/submission/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific PTSD assessment"""
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
    """Get all PTSD assessments (doctor only)"""
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access all assessments"
        )
    
    db = get_database()
    assessments = await db.assessments.find({
        "assessmentType": "ptsd",
        "status": "completed"
    }).to_list(None)
    return [serialize_doc(assessment) for assessment in assessments] 