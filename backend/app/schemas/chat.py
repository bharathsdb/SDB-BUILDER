from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    project_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    action: Optional[dict] = None
    conversation_id: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str] = None
    role: str
    content: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
