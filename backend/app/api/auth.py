# file: app/api/auth.py
from fastapi import APIRouter, Form, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.schemas import Token
from app.deps import create_token_for_user

router = APIRouter()

# very simple user store for demo
_demo_users = {"demo@example.com": {"id": "user-1", "password": "demo"}}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = _demo_users.get(form_data.username)
    if not user or form_data.password != user["password"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_token_for_user(user["id"])
    return {"access_token": token, "token_type": "bearer", "expires_in": 3600}

@router.post("/logout")
def logout():
    # client-side should drop token; server can also implement revocation
    return {"ok": True}
