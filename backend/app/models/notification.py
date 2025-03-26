from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    type: str
    message: str
    read: bool = False

class NotificationCreate(NotificationBase):
    userId: str

class NotificationUpdate(BaseModel):
    read: Optional[bool] = None
    message: Optional[str] = None

class Notification(NotificationBase):
    id: str
    userId: str
    createdAt: datetime

    class Config:
        from_attributes = True 