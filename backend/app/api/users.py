# file: app/api/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db, get_current_user
from app.models import User
from app.schemas.schemas import UserProfile, UserCreate
import uuid
from app.deps import hash_password

router = APIRouter()

@router.get("/me", response_model=UserProfile)
async def get_me(current=Depends(get_current_user)):
    return {"id": current.id, "email": current.email, "full_name": current.full_name}

@router.post("/", response_model=UserProfile)
async def create_user(cmd: UserCreate, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).where(User.email == cmd.email))
    if q.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User exists")
    uid = str(uuid.uuid4())
    user = User(id=uid, email=cmd.email, full_name=cmd.full_name, hashed_password=hash_password("changeme"))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "email": user.email, "full_name": user.full_name}
