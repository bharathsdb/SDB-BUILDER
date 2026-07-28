from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class MarketplaceListingResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    category: str
    price: float
    images: Optional[Any] = None
    tags: Optional[Any] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReviewResponse(BaseModel):
    id: str
    reviewer_id: str
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
