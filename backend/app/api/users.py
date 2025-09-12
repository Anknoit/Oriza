# file: app/api/users.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.schemas import UserProfile, UserCreate
from app.deps import get_current_user
import uuid

router = APIRouter()

# in-memory user store
_users = {
    "user-1": {"id": "user-1", "email": "demo@example.com", "full_name": "Demo User"}
}

@router.get("/me", response_model=UserProfile)
def get_me(current=Depends(get_current_user)):
    u = _users.get(current["id"])
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u

@router.post("/", response_model=UserProfile)
def create_user(cmd: UserCreate):
    uid = str(uuid.uuid4())
    _users[uid] = {"id": uid, "email": cmd.email, "full_name": cmd.full_name}
    return _users[uid]
