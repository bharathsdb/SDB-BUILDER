from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SettingsResponse(BaseModel):
    id: str
    user_id: str
    theme: str = "system"
    language: str = "en"
    units: str = "imperial"
    notifications_enabled: bool = True
    email_notifications: bool = True

    class Config:
        from_attributes = True


class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    units: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
