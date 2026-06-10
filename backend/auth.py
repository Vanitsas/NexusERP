from security import SECRET_KEY, ALGORITHM
from database import check_login
from jose import jwt
from datetime import datetime, timedelta

# 7 gün
EXPIRE_MINUTES = 10080


def authenticate(username, password):
    user = check_login(username, password)

    if not user:
        return None

    return user


def create_token(user: dict):
    payload = {
        "username": user["username"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)