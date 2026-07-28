from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.dependencies import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.marketplace import MarketplaceListing
from app.models.architect import Architect
from app.models.builder import Builder
from app.models.review import Review
from typing import Optional

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])


@router.get("/listings")
async def get_listings(
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(MarketplaceListing).where(MarketplaceListing.status == "active")
    if category:
        query = query.where(MarketplaceListing.category == category)
    query = query.order_by(desc(MarketplaceListing.created_at))

    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    listings = result.scalars().all()

    return {
        "listings": [
            {
                "id": l.id,
                "title": l.title,
                "description": l.description,
                "category": l.category,
                "price": l.price,
                "images": l.images,
                "tags": l.tags,
                "status": l.status,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in listings
        ]
    }


@router.get("/architects")
async def get_architects(
    specialization: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Architect).where(Architect.is_verified == True)
    if specialization:
        query = query.where(Architect.specialization.contains(specialization))

    result = await db.execute(query)
    architects = result.scalars().all()

    return {
        "architects": [
            {
                "id": a.id,
                "user_id": a.user_id,
                "company": a.company,
                "experience_years": a.experience_years,
                "specialization": a.specialization,
                "rating": a.rating,
                "review_count": a.review_count,
                "is_verified": a.is_verified,
                "location": a.location,
            }
            for a in architects
        ]
    }


@router.get("/reviews")
async def get_reviews(
    architect_id: Optional[str] = None,
    listing_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Review)
    if architect_id:
        query = query.where(Review.architect_id == architect_id)
    if listing_id:
        query = query.where(Review.listing_id == listing_id)
    query = query.order_by(desc(Review.created_at))

    result = await db.execute(query)
    reviews = result.scalars().all()

    return {
        "reviews": [
            {
                "id": r.id,
                "reviewer_id": r.reviewer_id,
                "rating": r.rating,
                "title": r.title,
                "content": r.content,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reviews
        ]
    }
