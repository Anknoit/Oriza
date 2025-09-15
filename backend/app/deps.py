# file: app/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import AsyncSessionLocal
from typing import AsyncGenerator
import secrets
from datetime import datetime
from passlib.context import CryptContext

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# simple in-memory token store — replace with Redis or DB-backed tokens in prod
_token_store: dict[str, dict] = {}

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

def create_token_for_user(user_id: str):
    token = secrets.token_urlsafe(32)
    _token_store[token] = {"user_id": user_id, "created": datetime.utcnow()}
    return token

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    info = _token_store.get(token)
    if not info:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    # fetch user from DB
    from sqlalchemy import select
    from app.models import User
    q = await db.execute(select(User).where(User.id == info["user_id"]))
    user = q.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
