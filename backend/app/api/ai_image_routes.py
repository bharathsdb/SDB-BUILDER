import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.api.auth import get_current_user
from app.models.media_asset import MediaAsset
from app.ai.ai_image_generator import AIImageGenerator

router = APIRouter(prefix="/api/ai-studio", tags=["AI-Studio"])

class GenerateRequest(BaseModel):
    prompt: str
    output_type: str = "both"  # "2d", "3d", "both", "photorealistic"
    api_key: Optional[str] = None

@router.get("/presets")
async def get_presets():
    return {
        "presets": ["Modern", "Contemporary", "Scandinavian", "Mediterranean", "Farmhouse", "Minimalist"],
        "examples": [
            "Modern 3-bedroom house with an open kitchen, 40x60 plot, east facing.",
            "Scandinavian minimalist villa with large windows and garden.",
            "Mediterranean style 2bhk home, 30x40 plot, south facing.",
            "Contemporary luxury mansion with open plan and vastu compliance."
        ]
    }

@router.post("/generate")
async def generate_images(
    req: GenerateRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    generator = AIImageGenerator()
    
    if req.output_type == "2d":
        result = generator.generate_2d(req.prompt)
    elif req.output_type == "3d":
        result = generator.generate_3d(req.prompt)
    elif req.output_type == "photorealistic":
        if not req.api_key:
            raise HTTPException(status_code=400, detail="API Key is required for photorealistic generation")
        result = generator.generate_photorealistic(req.prompt, req.api_key)
    else:
        result = generator.generate_both(req.prompt)
        
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Generation failed"))
        
    # Save to media assets for history
    asset = MediaAsset(
        user_id=uuid.UUID(user["id"]),
        file_path="",  # We might not store file physically, relying on tags/data instead or saving it.
        file_type="ai_generation",
        file_size=0,
        mime_type="application/json",
        tags={
            "prompt": req.prompt,
            "output_type": req.output_type,
            "pngBase64": result.get("pngBase64") or result.get("imageUrl"),
            # We don't save full glb to DB json column to avoid huge DB rows, 
            # ideally we save it to S3/disk and put path here. 
            # For simplicity in this local version, we'll omit storing large binaries in DB.
            "has_3d": bool(result.get("glbBase64")),
            "style": result.get("params", {}).get("style", "Modern"),
            "is_photorealistic": result.get("is_photorealistic", False)
        }
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    
    result["history_id"] = str(asset.id)
    return result

@router.get("/history")
async def get_history(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(MediaAsset)
        .where(MediaAsset.user_id == uuid.UUID(user["id"]))
        .where(MediaAsset.file_type == "ai_generation")
        .order_by(desc(MediaAsset.created_at))
        .limit(20)
    )
    assets = result.scalars().all()
    
    history = []
    for a in assets:
        history.append({
            "id": str(a.id),
            "prompt": a.tags.get("prompt"),
            "output_type": a.tags.get("output_type"),
            "style": a.tags.get("style"),
            "pngBase64": a.tags.get("pngBase64"),
            "created_at": a.created_at.isoformat() if a.created_at else None
        })
        
    return {"history": history}
