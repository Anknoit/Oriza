# file: app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import create_token_for_user, get_db, hash_password, verify_password
from app.models import User
from app.schemas.schemas import Token, UserCreate
import uuid

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(username: str = Form(...), password: str = Form(...), db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).where(User.email == username))
    user = q.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_token_for_user(user.id)
    return {"access_token": token, "token_type": "bearer", "expires_in": 3600}

@router.post("/register")
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # basic create user
    q = await db.execute(select(User).where(User.email == payload.email))
    existing = q.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = hash_password("demo") if payload.email == "demo@example.com" else hash_password("changeme")
    # in real world, accept password in payload
    u = User(id=str(uuid.uuid4()), email=payload.email, full_name=payload.full_name, hashed_password=hashed)
    db.add(u)
    await db.commit()
    await db.refresh(u)
    return {"id": u.id, "email": u.email}
