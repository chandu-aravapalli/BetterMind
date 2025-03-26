from fastapi import APIRouter, HTTPException
from typing import List
from app.models.notification import Notification, NotificationCreate, NotificationUpdate
from app.db.mongodb import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[Notification])
async def get_notifications():
    db = get_database()
    notifications = await db.notifications.find().to_list(length=None)
    return notifications

@router.get("/{notification_id}", response_model=Notification)
async def get_notification(notification_id: str):
    db = get_database()
    if (notification := await db.notifications.find_one({"_id": ObjectId(notification_id)})) is not None:
        return notification
    raise HTTPException(status_code=404, detail="Notification not found")

@router.get("/user/{user_id}", response_model=List[Notification])
async def get_user_notifications(user_id: str):
    db = get_database()
    notifications = await db.notifications.find({"userId": user_id}).to_list(length=None)
    return notifications

@router.get("/user/{user_id}/unread", response_model=List[Notification])
async def get_unread_notifications(user_id: str):
    db = get_database()
    notifications = await db.notifications.find({"userId": user_id, "read": False}).to_list(length=None)
    return notifications

@router.post("/", response_model=Notification)
async def create_notification(notification: NotificationCreate):
    db = get_database()
    notification_dict = notification.model_dump()
    notification_dict["createdAt"] = datetime.utcnow()
    result = await db.notifications.insert_one(notification_dict)
    
    if (created_notification := await db.notifications.find_one({"_id": result.inserted_id})) is not None:
        return created_notification
    raise HTTPException(status_code=500, detail="Failed to create notification")

@router.put("/{notification_id}", response_model=Notification)
async def update_notification(notification_id: str, notification: NotificationUpdate):
    db = get_database()
    notification_dict = notification.model_dump(exclude_unset=True)
    
    if (await db.notifications.find_one({"_id": ObjectId(notification_id)})) is None:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": notification_dict}
    )
    
    if (updated_notification := await db.notifications.find_one({"_id": ObjectId(notification_id)})) is not None:
        return updated_notification
    raise HTTPException(status_code=500, detail="Failed to update notification")

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    db = get_database()
    if (await db.notifications.find_one({"_id": ObjectId(notification_id)})) is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    await db.notifications.delete_one({"_id": ObjectId(notification_id)})
    return {"message": "Notification deleted successfully"} 