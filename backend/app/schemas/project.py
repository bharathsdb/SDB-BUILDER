from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ProjectCreate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = ""
    plot_length: float = 0
    plot_width: float = 0
    facing: str = "North"
    floors: int = 1
    budget_tier: str = "Standard"
    style: str = "Modern"
    vastu: bool = True


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    plot_length: Optional[float] = None
    plot_width: Optional[float] = None
    facing: Optional[str] = None
    floors: Optional[int] = None
    budget_tier: Optional[str] = None
    style: Optional[str] = None
    vastu: Optional[bool] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    plot_length: float
    plot_width: float
    facing: str
    floors: int
    budget_tier: str
    style: str
    vastu: bool
    status: str
    shared: bool
    share_url: Optional[str] = None
    view_count: int
    vastu_score: Optional[int] = None
    sustainability_score: Optional[int] = None
    stars: Optional[int] = None
    tags: Optional[Any] = None
    thumbnail: Optional[str] = None
    rooms: list = []
    cost_estimate: Optional[Any] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
    total: int
    page: int = 1
    per_page: int = 20
