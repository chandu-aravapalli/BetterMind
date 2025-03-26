from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.models.user import User
from app.models.assessment import Assessment
from app.db.mongodb import get_database
from app.core.auth import get_current_user
from bson import ObjectId
from datetime import datetime
from ..ai import generate_patient_summary

router = APIRouter(tags=["doctor"])

@router.get("/patients", response_model=List[dict])
async def get_patients(current_user: dict = Depends(get_current_user)):
    """Get all patients for a doctor who have completed assessments"""
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access patient lists"
        )
    
    db = get_database()
    
    # Get all completed assessments
    completed_assessments = await db.assessments.distinct(
        "userId",
        {"status": "completed"}
    )
    
    # Get all users with role 'patient' who have completed assessments
    patients = await db.users.find({
        "role": "patient",
        "_id": {"$in": [ObjectId(user_id) for user_id in completed_assessments]}
    }).to_list(None)
    
    # For each patient, get their assessment information
    patient_list = []
    for patient in patients:
        # Get the most recent assessment
        last_assessment = await db.assessments.find_one(
            {"userId": str(patient["_id"])},
            sort=[("completedAt", -1)]
        )
        
        # Get recent assessment results
        recent_results = await db.assessments.find({
            "userId": str(patient["_id"]),
            "status": "completed",
            "completedAt": {"$exists": True}
        }).sort("completedAt", -1).limit(3).to_list(None)
        
        # Count total assessments
        assessment_count = await db.assessments.count_documents({
            "userId": str(patient["_id"])
        })
        
        # Format the results
        formatted_results = []
        for result in recent_results:
            formatted_results.append({
                "type": result["assessmentType"].capitalize() + " Assessment",
                "score": result.get("score", 0),
                "severity": result.get("severity", "Not Available"),
                "date": result["completedAt"].isoformat() if result.get("completedAt") else None
            })
        
        # Create patient info object
        patient_info = {
            "id": str(patient["_id"]),
            "name": f"{patient.get('firstName', '')} {patient.get('lastName', '')}".strip() or "Unknown",
            "email": patient.get("email", ""),
            "gender": patient.get("gender", "Not specified"),
            "age": patient.get("age"),
            "phone": patient.get("phone", ""),
            "dateOfBirth": patient.get("dateOfBirth", ""),
            "lastAssessment": last_assessment["completedAt"].isoformat() if last_assessment and last_assessment.get("completedAt") else None,
            "assessmentCount": assessment_count,
            "status": "active",  # All patients in this list are active since they have completed assessments
            "recentResults": formatted_results
        }
        patient_list.append(patient_info)
    
    return patient_list

@router.get("/patients/{patient_id}", response_model=dict)
async def get_patient_details(
    patient_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific patient"""
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access patient details"
        )
    
    db = get_database()
    
    # Get patient information
    patient = await db.users.find_one({"_id": ObjectId(patient_id), "role": "patient"})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get all assessments for the patient
    assessments = await db.assessments.find({
        "userId": patient_id,
        "status": "completed"
    }).sort("completedAt", -1).to_list(None)
    
    # Format the assessments
    formatted_assessments = []
    for assessment in assessments:
        formatted_assessments.append({
            "id": str(assessment["_id"]),
            "type": assessment["assessmentType"],
            "score": assessment.get("score", 0),
            "severity": assessment.get("severity", "Not Available"),
            "completedAt": assessment["completedAt"].isoformat() if assessment.get("completedAt") else None,
            "questions": assessment.get("questions", [])
        })
    
    # Create detailed patient info
    patient_details = {
        "id": str(patient["_id"]),
        "firstName": patient.get("firstName", ""),
        "lastName": patient.get("lastName", ""),
        "email": patient.get("email", ""),
        "gender": patient.get("gender", "Not specified"),
        "age": patient.get("age"),
        "phone": patient.get("phone", ""),
        "dateOfBirth": patient.get("dateOfBirth", ""),
        "address": patient.get("address", ""),
        "emergencyContact": patient.get("emergencyContact", {}),
        "medicalHistory": patient.get("medicalHistory", {}),
        "status": "active" if len(formatted_assessments) > 0 else "inactive",
        "assessments": formatted_assessments,
        "registeredAt": patient.get("createdAt", "").isoformat() if patient.get("createdAt") else None,
        "lastLogin": patient.get("lastLogin", "").isoformat() if patient.get("lastLogin") else None
    }
    
    return patient_details

@router.get("/patients/{patient_id}/ai-summary")
async def get_patient_ai_summary(
    patient_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate an AI summary for a specific patient"""
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access patient summaries"
        )
    
    db = get_database()
    
    # Get patient information
    patient = await db.users.find_one({"_id": ObjectId(patient_id), "role": "patient"})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get all assessments for the patient
    assessments = await db.assessments.find({
        "userId": patient_id,
        "status": "completed"
    }).sort("completedAt", -1).to_list(None)
    
    # Generate AI summary
    summary = await generate_patient_summary(patient, assessments)
    
    return {"summary": summary} 