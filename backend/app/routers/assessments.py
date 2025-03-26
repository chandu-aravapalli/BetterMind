from fastapi import APIRouter, HTTPException
from typing import List, Dict
from app.models.assessment import Assessment, AssessmentCreate, AssessmentUpdate
from app.db.mongodb import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[Assessment])
async def get_assessments():
    db = get_database()
    assessments = await db.assessments.find().to_list(length=None)
    return assessments

@router.get("/{assessment_id}", response_model=Assessment)
async def get_assessment(assessment_id: str):
    db = get_database()
    if (assessment := await db.assessments.find_one({"_id": ObjectId(assessment_id)})) is not None:
        return assessment
    raise HTTPException(status_code=404, detail="Assessment not found")

@router.get("/user/{user_id}", response_model=List[Assessment])
async def get_user_assessments(user_id: str):
    db = get_database()
    assessments = await db.assessments.find({"userId": user_id}).to_list(length=None)
    return assessments

@router.post("/", response_model=Assessment)
async def create_assessment(assessment: AssessmentCreate):
    db = get_database()
    assessment_dict = assessment.model_dump()
    assessment_dict["startedAt"] = datetime.utcnow()
    result = await db.assessments.insert_one(assessment_dict)
    
    if (created_assessment := await db.assessments.find_one({"_id": result.inserted_id})) is not None:
        return created_assessment
    raise HTTPException(status_code=500, detail="Failed to create assessment")

@router.put("/{assessment_id}", response_model=Assessment)
async def update_assessment(assessment_id: str, assessment: AssessmentUpdate):
    db = get_database()
    assessment_dict = assessment.model_dump(exclude_unset=True)
    
    if (await db.assessments.find_one({"_id": ObjectId(assessment_id)})) is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    await db.assessments.update_one(
        {"_id": ObjectId(assessment_id)},
        {"$set": assessment_dict}
    )
    
    if (updated_assessment := await db.assessments.find_one({"_id": ObjectId(assessment_id)})) is not None:
        return updated_assessment
    raise HTTPException(status_code=500, detail="Failed to update assessment")

@router.delete("/{assessment_id}")
async def delete_assessment(assessment_id: str):
    db = get_database()
    if (await db.assessments.find_one({"_id": ObjectId(assessment_id)})) is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    await db.assessments.delete_one({"_id": ObjectId(assessment_id)})
    return {"message": "Assessment deleted successfully"}

@router.get("/status/{user_id}", response_model=Dict[str, str])
async def get_assessment_status(user_id: str):
    """Get the status of all assessments for a user."""
    db = get_database()
    
    # Get all assessments for the user
    assessments = await db.assessments.find({"userId": user_id}).to_list(length=None)
    
    # Initialize default status for all assessment types
    status = {
        "1": "pending",  # Pre-assessment
        "2": "pending",  # Stress assessment
        "3": "pending",  # Anxiety assessment
        "4": "pending"   # PTSD assessment
    }
    
    # Update status based on completed assessments
    for assessment in assessments:
        assessment_type = assessment.get("assessmentType")
        if assessment_type == "pre":
            status["1"] = assessment.get("status", "pending")
        elif assessment_type == "stress":
            status["2"] = assessment.get("status", "pending")
        elif assessment_type == "anxiety":
            status["3"] = assessment.get("status", "pending")
        elif assessment_type == "ptsd":
            status["4"] = assessment.get("status", "pending")
    
    return status 