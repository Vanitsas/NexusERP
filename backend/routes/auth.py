from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from auth import authenticate, create_token

router = APIRouter()

# =========================
# REQUEST MODEL
# =========================
class LoginRequest(BaseModel):
    username: str
    password: str


# =========================
# LOGIN ENDPOINT
# =========================
@router.post("/login")
def login(data: LoginRequest):
    user = authenticate(data.username, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }