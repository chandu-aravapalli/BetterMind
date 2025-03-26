from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

class UserBase(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    role: Literal['doctor', 'patient']
    gender: Literal['male', 'female', 'other']
    dateOfBirth: datetime
    phoneNumber: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None
    gender: Optional[Literal['male', 'female', 'other']] = None
    dateOfBirth: Optional[datetime] = None
    password: Optional[str] = None

class User(UserBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str 