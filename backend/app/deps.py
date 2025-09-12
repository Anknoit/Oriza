# file: app/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from datetime import datetime, timedelta
import secrets

# Simple token scheme (replace with JWT or OAuth provider in prod)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# in-memory token -> user map for starter
_token_store = {}

def create_token_for_user(user_id: str):
    token = secrets.token_urlsafe(32)
    # simple expiry not enforced in this stub
    _token_store[token] = {"user_id": user_id, "created": datetime.utcnow()}
    return token

def get_current_user(token: str = Depends(oauth2_scheme)):
    info = _token_store.get(token)
    if not info:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return {"id": info["user_id"], "email": f"user+{info['user_id']}@example.com"}
