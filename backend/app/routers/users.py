from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from app.models.user import User, UserCreate, UserUpdate, Token, UserLogin
from app.db.mongodb import get_database
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.auth import get_current_user
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter()

def transform_user(user_doc):
    # Convert _id to string id and handle the document transformation
    if user_doc:
        user_dict = dict(user_doc)
        user_dict["id"] = str(user_dict.pop("_id"))
        # Remove MongoDB specific fields if they exist
        user_dict.pop("__v", None)
        # Don't expose password hash in responses
        user_dict.pop("password", None)
        return user_dict
    return None

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"]}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user = Depends(get_current_user)):
    return transform_user(current_user)

@router.get("/", response_model=List[User])
async def get_users(current_user: dict = Depends(get_current_user)):
    # Only allow doctors to see all users
    if current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized to view all users")
    
    db = get_database()
    users = await db.users.find().to_list(length=None)
    transformed_users = [transform_user(user) for user in users]
    return transformed_users

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if (user := await db.users.find_one({"_id": ObjectId(user_id)})) is not None:
        # Only allow users to see their own data or doctors to see any user
        if str(user["_id"]) == str(current_user["_id"]) or current_user["role"] == "doctor":
            return transform_user(user)
        raise HTTPException(status_code=403, detail="Not authorized to view this user")
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/", response_model=User)
async def create_user(user: UserCreate):
    db = get_database()
    
    # Check if email already exists
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.model_dump()
    # Hash the password
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["createdAt"] = datetime.utcnow()
    user_dict["updatedAt"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_dict)
    
    if (created_user := await db.users.find_one({"_id": result.inserted_id})) is not None:
        return transform_user(created_user)
    raise HTTPException(status_code=500, detail="Failed to create user")

@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: str, 
    user: UserUpdate, 
    current_user: dict = Depends(get_current_user)
):
    # Only allow users to update their own data or doctors to update any user
    if str(current_user["_id"]) != user_id and current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    db = get_database()
    user_dict = user.model_dump(exclude_unset=True)
    
    # If password is being updated, hash it
    if "password" in user_dict:
        user_dict["password"] = get_password_hash(user_dict["password"])
    
    user_dict["updatedAt"] = datetime.utcnow()
    
    if (await db.users.find_one({"_id": ObjectId(user_id)})) is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": user_dict}
    )
    
    if (updated_user := await db.users.find_one({"_id": ObjectId(user_id)})) is not None:
        return transform_user(updated_user)
    raise HTTPException(status_code=500, detail="Failed to update user")

@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    # Only allow users to delete their own account or doctors to delete any user
    if str(current_user["_id"]) != user_id and current_user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    
    db = get_database()
    if (await db.users.find_one({"_id": ObjectId(user_id)})) is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted successfully"}