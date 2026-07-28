from datetime import datetime, timedelta, timezone
from jose import jwt
import bcrypt
from app.config import get_settings
import uuid

settings = get_settings()


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, role: str = "user") -> str:
    expires = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRATION)
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expires,
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRATION)
    payload = {
        "sub": str(user_id),
        "exp": expires,
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid.uuid4()),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except Exception:
        return None
