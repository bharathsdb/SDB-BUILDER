"""
Image-to-2D/3D API Routes - Image upload, analysis, 2D plan generation, 3D model generation.
Supports: batch upload, camera capture, blueprint/sketch/house/site image types.
"""
import os
import uuid
import json
import base64
import logging
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.api.auth import get_current_user
from app.models.media_asset import MediaAsset
from app.models.render_job import RenderJob
from app.models.floor_plan import FloorPlan
from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/cv", tags=["Image-to-2D/3D"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".heic", ".pdf"}


def _validate_image(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    image_type: str = Form("blueprint"),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}",
        )

    contents = await file.read()
    file_size = len(contents)
    if file_size > get_settings().MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max: {get_settings().MAX_UPLOAD_SIZE_MB}MB",
        )

    upload_dir = os.path.join("uploads", "blueprints")
    os.makedirs(upload_dir, exist_ok=True)
    file_id = uuid.uuid4().hex[:12]
    ext = os.path.splitext(file.filename)[1].lower()
    saved_name = f"{file_id}{ext}"
    file_path = os.path.join(upload_dir, saved_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    width = height = 0
    try:
        import cv2
        import numpy as np
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            height, width = img.shape[:2]
    except ImportError:
        pass

    asset = MediaAsset(
        user_id=uuid.UUID(user["id"]),
        project_id=uuid.UUID(project_id) if project_id else None,
        file_path=file_path,
        file_type="image",
        file_size=file_size,
        width=width,
        height=height,
        mime_type=file.content_type or f"image/{ext.replace('.', '')}",
        tags={"image_type": image_type, "original_name": file.filename},
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    return {
        "success": True,
        "asset_id": str(asset.id),
        "file_path": f"/{file_path.replace(os.sep, '/')}",
        "width": width,
        "height": height,
        "file_size": file_size,
    }


@router.post("/batch-upload")
async def batch_upload(
    files: List[UploadFile] = File(...),
    project_id: str = Form(None),
    image_type: str = Form("blueprint"),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    results = []
    errors = []

    for file in files:
        if not _validate_image(file.filename):
            errors.append({"filename": file.filename, "error": "Unsupported file type"})
            continue

        contents = await file.read()
        file_size = len(contents)
        if file_size > get_settings().MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            errors.append({"filename": file.filename, "error": "File too large"})
            continue

        upload_dir = os.path.join("uploads", "blueprints")
        os.makedirs(upload_dir, exist_ok=True)
        file_id = uuid.uuid4().hex[:12]
        ext = os.path.splitext(file.filename)[1].lower()
        saved_name = f"{file_id}{ext}"
        file_path = os.path.join(upload_dir, saved_name)

        with open(file_path, "wb") as f:
            f.write(contents)

        width = height = 0
        try:
            import cv2
            import numpy as np
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                height, width = img.shape[:2]
        except ImportError:
            pass

        asset = MediaAsset(
            user_id=uuid.UUID(user["id"]),
            project_id=uuid.UUID(project_id) if project_id else None,
            file_path=file_path,
            file_type="image",
            file_size=file_size,
            width=width,
            height=height,
            mime_type=file.content_type or f"image/{ext.replace('.', '')}",
            tags={
                "image_type": image_type,
                "original_name": file.filename,
                "batch_upload": True,
            },
        )
        db.add(asset)
        await db.flush()

        results.append({
            "success": True,
            "asset_id": str(asset.id),
            "file_path": f"/{file_path.replace(os.sep, '/')}",
            "filename": file.filename,
            "width": width,
            "height": height,
            "file_size": file_size,
        })

    await db.commit()

    return {
        "success": True,
        "results": results,
        "errors": errors,
        "total": len(results) + len(errors),
        "uploaded": len(results),
        "failed": len(errors),
    }


@router.post("/capture-upload")
async def capture_upload(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    image_type: str = Form("blueprint"),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    file_size = len(contents)

    upload_dir = os.path.join("uploads", "captures")
    os.makedirs(upload_dir, exist_ok=True)
    file_id = uuid.uuid4().hex[:12]
    saved_name = f"capture_{file_id}.png"
    file_path = os.path.join(upload_dir, saved_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    width = height = 0
    try:
        import cv2
        import numpy as np
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            height, width = img.shape[:2]
    except ImportError:
        pass

    asset = MediaAsset(
        user_id=uuid.UUID(user["id"]),
        project_id=uuid.UUID(project_id) if project_id else None,
        file_path=file_path,
        file_type="image",
        file_size=file_size,
        width=width,
        height=height,
        mime_type="image/png",
        tags={
            "image_type": image_type,
            "original_name": saved_name,
            "source": "camera_capture",
        },
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    return {
        "success": True,
        "asset_id": str(asset.id),
        "file_path": f"/{file_path.replace(os.sep, '/')}",
        "width": width,
        "height": height,
        "file_size": file_size,
    }


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    image_type: str = Form("blueprint"),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    from app.ai.image_to_plan import ImageToPlanPipeline

    pipeline = ImageToPlanPipeline()
    result = pipeline.analyze(contents, image_type)

    if not result.get("success"):
        raise HTTPException(status_code=422, detail=result.get("error", "Analysis failed"))

    return result


@router.post("/analyze-site")
async def analyze_site(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    from app.ai.image_to_plan import ImageToPlanPipeline

    pipeline = ImageToPlanPipeline()
    result = pipeline.analyze_site_image(contents)

    if not result.get("success"):
        raise HTTPException(status_code=422, detail=result.get("error", "Analysis failed"))

    return result


@router.post("/sketch-to-plan")
async def sketch_to_plan(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    from app.ai.image_to_plan import ImageToPlanPipeline

    pipeline = ImageToPlanPipeline()
    analysis = pipeline.analyze(contents, "sketch")

    if not analysis.get("success"):
        raise HTTPException(status_code=422, detail=analysis.get("error", "Analysis failed"))

    floor_plan_data = None
    if project_id:
        floor_plan = FloorPlan(
            project_id=uuid.UUID(project_id),
            name=f"Sketch to Plan - {file.filename}",
            version=1,
            data={
                "rooms": analysis["rooms"],
                "walls": analysis["walls"],
                "doors": analysis["doors"],
                "windows": analysis["windows"],
                "source_image": file.filename,
                "image_type": "sketch",
                "confidence_scores": analysis["confidence_scores"],
            },
            is_active=True,
        )
        db.add(floor_plan)
        await db.commit()
        await db.refresh(floor_plan)
        floor_plan_data = {"id": str(floor_plan.id), "name": floor_plan.name}

    return {
        "success": True,
        "floorPlan": floor_plan_data,
        "rooms": analysis["rooms"],
        "walls": analysis["walls"],
        "doors": analysis["doors"],
        "windows": analysis["windows"],
        "processedImage": analysis.get("processedImage"),
        "processedSvg": analysis.get("processedSvg"),
        "dimensions": analysis.get("dimensions_data", []),
        "annotations": analysis.get("annotations", []),
        "confidenceScores": analysis.get("confidence_scores", {}),
        "suggestions": analysis.get("suggestions", []),
        "overallScore": analysis.get("overallScore", 68),
        "logs": analysis.get("logs", []),
        "stageProgress": analysis.get("stageProgress", {}),
    }


@router.post("/house-to-plan")
async def house_to_plan(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    from app.ai.image_to_plan import ImageToPlanPipeline

    pipeline = ImageToPlanPipeline()
    analysis = pipeline.analyze(contents, "house")

    if not analysis.get("success"):
        raise HTTPException(status_code=422, detail=analysis.get("error", "Analysis failed"))

    floor_plan_data = None
    if project_id:
        floor_plan = FloorPlan(
            project_id=uuid.UUID(project_id),
            name=f"House to Plan - {file.filename}",
            version=1,
            data={
                "rooms": analysis["rooms"],
                "walls": analysis["walls"],
                "doors": analysis["doors"],
                "windows": analysis["windows"],
                "source_image": file.filename,
                "image_type": "house",
                "confidence_scores": analysis["confidence_scores"],
            },
            is_active=True,
        )
        db.add(floor_plan)
        await db.commit()
        await db.refresh(floor_plan)
        floor_plan_data = {"id": str(floor_plan.id), "name": floor_plan.name}

    return {
        "success": True,
        "floorPlan": floor_plan_data,
        "rooms": analysis["rooms"],
        "walls": analysis["walls"],
        "doors": analysis["doors"],
        "windows": analysis["windows"],
        "processedImage": analysis.get("processedImage"),
        "processedSvg": analysis.get("processedSvg"),
        "confidenceScores": analysis.get("confidence_scores", {}),
        "suggestions": analysis.get("suggestions", []),
        "overallScore": analysis.get("overallScore", 60),
        "logs": analysis.get("logs", []),
        "stageProgress": analysis.get("stageProgress", {}),
    }


@router.post("/image-to-plan")
async def image_to_plan(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    image_type: str = Form("blueprint"),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    from app.ai.image_to_plan import ImageToPlanPipeline

    pipeline = ImageToPlanPipeline()
    analysis = pipeline.analyze(contents, image_type)

    if not analysis.get("success"):
        raise HTTPException(status_code=422, detail=analysis.get("error", "Analysis failed"))

    floor_plan_data = None
    if project_id:
        floor_plan = FloorPlan(
            project_id=uuid.UUID(project_id),
            name=f"AI Generated from {file.filename}",
            version=1,
            data={
                "rooms": analysis["rooms"],
                "walls": analysis["walls"],
                "doors": analysis["doors"],
                "windows": analysis["windows"],
                "source_image": file.filename,
                "image_type": image_type,
                "confidence_scores": analysis["confidence_scores"],
            },
            is_active=True,
        )
        db.add(floor_plan)
        await db.commit()
        await db.refresh(floor_plan)
        floor_plan_data = {"id": str(floor_plan.id), "name": floor_plan.name, "version": floor_plan.version}

    return {
        "success": True,
        "floorPlan": floor_plan_data,
        "rooms": analysis["rooms"],
        "walls": analysis["walls"],
        "doors": analysis["doors"],
        "windows": analysis["windows"],
        "processedImage": analysis.get("processedImage"),
        "processedSvg": analysis.get("processedSvg"),
        "dimensions": analysis.get("dimensions_data", []),
        "annotations": analysis.get("annotations", []),
        "confidenceScores": analysis.get("confidence_scores", {}),
        "suggestions": analysis.get("suggestions", []),
        "overallScore": analysis.get("overallScore", 70),
        "logs": analysis.get("logs", []),
        "stageProgress": analysis.get("stageProgress", {}),
    }


@router.post("/image-to-3d")
async def image_to_3d(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    image_type: str = Form("blueprint"),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    from app.ai.image_to_plan import ImageToPlanPipeline

    pipeline = ImageToPlanPipeline()
    analysis = pipeline.analyze(contents, image_type)

    if not analysis.get("success"):
        raise HTTPException(status_code=422, detail=analysis.get("error", "Analysis failed"))

    render_job_data = None
    if project_id:
        job = RenderJob(
            project_id=uuid.UUID(project_id),
            user_id=uuid.UUID(user["id"]),
            render_type="image_to_3d",
            status="completed",
            progress=100.0,
            output_urls={
                "scene": analysis.get("scene"),
                "glbBase64": analysis.get("glbBase64"),
                "elevations": analysis.get("elevations", {}),
            },
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        render_job_data = {"id": str(job.id), "status": "completed"}

    return {
        "success": True,
        "renderJob": render_job_data,
        "scene": analysis.get("scene"),
        "glbBase64": analysis.get("glbBase64"),
        "elevations": analysis.get("elevations", {}),
        "rooms": analysis["rooms"],
        "confidenceScores": analysis.get("confidence_scores", {}),
        "suggestions": analysis.get("suggestions", []),
        "overallScore": analysis.get("overallScore", 70),
        "logs": analysis.get("logs", []),
    }


@router.post("/generate-views")
async def generate_views(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    from app.ai.image_to_plan import ImageToPlanPipeline

    pipeline = ImageToPlanPipeline()
    analysis = pipeline.analyze(contents, "blueprint")

    return {
        "success": True,
        "topView": analysis.get("processedImage"),
        "frontElevation": analysis.get("elevations", {}).get("front"),
        "sideElevation": analysis.get("elevations", {}).get("side"),
        "birdsEyeView": analysis.get("elevations", {}).get("birdsEye"),
        "scene": analysis.get("scene"),
    }


@router.get("/jobs/{job_id}")
async def get_cv_job_status(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(RenderJob).where(RenderJob.id == uuid.UUID(job_id))
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": str(job.id),
        "status": job.status,
        "progress": job.progress,
        "render_type": job.render_type,
        "output_urls": job.output_urls,
        "created_at": job.created_at.isoformat() if job.created_at else None,
    }


@router.get("/project/all/media")
async def get_all_user_media(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(MediaAsset)
        .where(MediaAsset.user_id == uuid.UUID(user["id"]))
        .order_by(MediaAsset.created_at.desc())
        .limit(100)
    )
    assets = result.scalars().all()
    return {
        "success": True,
        "assets": [
            {
                "id": str(a.id),
                "file_path": f"/{a.file_path.replace(os.sep, '/')}" if a.file_path else None,
                "file_type": a.file_type,
                "file_size": a.file_size,
                "width": a.width,
                "height": a.height,
                "mime_type": a.mime_type,
                "tags": a.tags,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in assets
        ],
    }


@router.get("/project/{project_id}/media")
async def get_project_media(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(MediaAsset).where(MediaAsset.project_id == uuid.UUID(project_id))
    )
    assets = result.scalars().all()
    return {
        "success": True,
        "assets": [
            {
                "id": str(a.id),
                "file_path": f"/{a.file_path.replace(os.sep, '/')}" if a.file_path else None,
                "file_type": a.file_type,
                "file_size": a.file_size,
                "width": a.width,
                "height": a.height,
                "mime_type": a.mime_type,
                "tags": a.tags,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in assets
        ],
    }


@router.delete("/media/{asset_id}")
async def delete_media_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(MediaAsset).where(MediaAsset.id == uuid.UUID(asset_id))
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    if str(asset.user_id) != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this asset")

    # Delete file from disk
    if asset.file_path and os.path.exists(asset.file_path):
        try:
            os.remove(asset.file_path)
        except OSError:
            pass

    await db.delete(asset)
    await db.commit()
    return {"success": True, "message": "Asset deleted"}


@router.post("/render-and-analyze")
async def render_and_analyze(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    image_type: str = Form("blueprint"),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if not _validate_image(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file type.")

    contents = await file.read()
    file_size = len(contents)
    if file_size > get_settings().MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large.")

    upload_dir = os.path.join("uploads", "renders")
    os.makedirs(upload_dir, exist_ok=True)
    file_id = uuid.uuid4().hex[:12]
    ext = os.path.splitext(file.filename)[1].lower()
    saved_name = f"{file_id}{ext}"
    file_path = os.path.join(upload_dir, saved_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    asset = MediaAsset(
        user_id=uuid.UUID(user["id"]),
        project_id=uuid.UUID(project_id) if project_id else None,
        file_path=file_path,
        file_type="image",
        file_size=file_size,
        mime_type=file.content_type or f"image/{ext.replace('.', '')}",
        tags={"image_type": image_type, "original_name": file.filename, "source": "render_and_analyze"},
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    from app.ai.image_to_plan import ImageToPlanPipeline

    pipeline = ImageToPlanPipeline()
    analysis = pipeline.analyze(contents, image_type)

    if not analysis.get("success"):
        raise HTTPException(status_code=422, detail=analysis.get("error", "Analysis failed"))

    floor_plan_data = None
    if project_id:
        floor_plan = FloorPlan(
            project_id=uuid.UUID(project_id),
            name=f"Rendered - {file.filename}",
            version=1,
            data={
                "rooms": analysis.get("rooms", []),
                "walls": analysis.get("walls", []),
                "doors": analysis.get("doors", []),
                "windows": analysis.get("windows", []),
                "source_image": file.filename,
                "image_type": image_type,
            },
            is_active=True,
        )
        db.add(floor_plan)
        await db.commit()
        await db.refresh(floor_plan)
        floor_plan_data = {"id": str(floor_plan.id), "name": floor_plan.name}

    # Render 3D from the same analysis data
    scene = analysis.get("scene")
    glb_base64 = analysis.get("glbBase64")
    elevations = analysis.get("elevations", {})
    if not scene and not glb_base64:
        from app.rendering.three_d_gen import ThreeDGenerator
        rooms_3d = analysis.get("rooms", [])
        if rooms_3d:
            gen = ThreeDGenerator()
            scene_data = gen.generate(rooms_3d, "modern")
            if scene_data:
                scene = scene_data.get("scene")
                glb_base64 = scene_data.get("glbBase64")

    return {
        "success": True,
        "asset_id": str(asset.id),
        "file_path": f"/{file_path.replace(os.sep, '/')}",
        "file_size": file_size,
        "floorPlan": floor_plan_data,
        "rooms": analysis.get("rooms", []),
        "walls": analysis.get("walls", []),
        "doors": analysis.get("doors", []),
        "windows": analysis.get("windows", []),
        "processedImage": analysis.get("processedImage"),
        "processedSvg": analysis.get("processedSvg"),
        "dimensions": analysis.get("dimensions_data", []),
        "annotations": analysis.get("annotations", []),
        "confidenceScores": analysis.get("confidence_scores", {}),
        "suggestions": analysis.get("suggestions", []),
        "overallScore": analysis.get("overallScore", 70),
        "scene": scene,
        "glbBase64": glb_base64,
        "elevations": elevations,
        "logs": analysis.get("logs", []),
        "stageProgress": analysis.get("stageProgress", {}),
    }
