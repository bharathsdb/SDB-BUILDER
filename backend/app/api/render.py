from fastapi import APIRouter, HTTPException, Request, Depends
import base64
import logging
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.api.auth import get_current_user
from app.models.render_job import RenderJob

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/render", tags=["Rendering"])


@router.post("/jobs")
async def create_render_job(
    request: Request,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    try:
        project_id = payload.get("project_id")
        render_type = payload.get("render_type", "2d_blueprint")
        rooms = payload.get("rooms", [])

        if not project_id:
            raise HTTPException(status_code=400, detail="project_id is required")

        job = RenderJob(
            project_id=uuid.UUID(project_id),
            user_id=uuid.UUID(user["id"]),
            render_type=render_type,
            status="pending",
            progress=0.0
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)

        import json
        rooms_json = json.dumps(rooms)

        from backend.celery_worker import render_2d_blueprint_task, render_3d_scene_task

        if render_type == "2d_blueprint":
            render_2d_blueprint_task.delay(str(job.id), project_id, rooms_json, user["id"])
        else:
            view_type = render_type.split("_")[-1] if "_" in render_type else "exterior"
            render_3d_scene_task.delay(str(job.id), project_id, rooms_json, user["id"], view_type)

        return {"success": True, "job_id": str(job.id)}
    except Exception as e:
        logger.error(f"Failed to create render job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs/{job_id}")
async def get_render_job(job_id: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    try:
        from sqlalchemy import select
        result = await db.execute(select(RenderJob).where(RenderJob.id == uuid.UUID(job_id)))
        job = result.scalar_one_or_none()

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        return {
            "id": str(job.id),
            "status": job.status,
            "progress": job.progress,
            "urls": job.output_urls,
            "type": job.render_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{project_id}")
async def get_project_renders(project_id: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    try:
        from sqlalchemy import select
        result = await db.execute(select(RenderJob).where(RenderJob.project_id == uuid.UUID(project_id)))
        jobs = result.scalars().all()

        return {
            "success": True,
            "renders": [
                {
                    "id": str(job.id),
                    "status": job.status,
                    "progress": job.progress,
                    "urls": job.output_urls,
                    "type": job.render_type,
                    "created_at": job.created_at.isoformat()
                } for job in jobs
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
