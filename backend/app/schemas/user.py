from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    plan: str
    verified: bool
    is_active: bool
    company: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    ai_credits_used: int = 0
    ai_credits_total: int = 50
    storage_used_mb: int = 0
    storage_quota_mb: int = 5120
    projects_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
