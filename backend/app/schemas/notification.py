from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    category: Optional[str] = None
    is_read: bool
    link: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    id: Optional[str] = None
    read: bool = True
