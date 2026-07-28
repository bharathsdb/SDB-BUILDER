from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ExportRequest(BaseModel):
    project_id: str
    format: str  # pdf, png, jpg, svg, report
    options: Optional[dict] = None


class ExportResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    type: str
    format: str
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
