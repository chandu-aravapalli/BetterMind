from app.db.mongodb import get_database, connect_to_mongo, close_mongo_connection
from app.core.security import get_password_hash
import asyncio

async def hash_existing_passwords():
    # Connect to MongoDB
    await connect_to_mongo()
    
    try:
        db = get_database()
        
        # Get all users
        users = await db.users.find({}).to_list(None)
        
        print(f"Found {len(users)} users to process")
        
        for user in users:
            # Skip if password is already hashed (bcrypt hashes start with $2b$)
            if user.get("password", "").startswith("$2b$"):
                print(f"Skipping user {user.get('email')} - password already hashed")
                continue
            
            # Hash the password
            plain_password = user.get("password")
            if not plain_password:
                print(f"Warning: No password found for user {user.get('email')}")
                continue
            
            hashed_password = get_password_hash(plain_password)
            
            # Update the user document
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"password": hashed_password}}
            )
            
            print(f"Updated password for user {user.get('email')}")
    finally:
        # Close MongoDB connection
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(hash_existing_passwords())