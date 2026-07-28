from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from app.services.project_service import ProjectService
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("")
async def list_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    return await service.get_projects(current_user.id, page, per_page, status)


import logging
import traceback

logger = logging.getLogger(__name__)

@router.post("", status_code=201)
async def create_project(
    req: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        logger.info(f"Incoming create_project payload: {req.model_dump_json(indent=2)}")
        logger.info("Calling ProjectService.create_project (writing to DB)...")
        service = ProjectService(db)
        project = await service.create_project(current_user.id, req)
        logger.info("Project created successfully in DB.")
        
        # Check if DALL-E generation or Kotlin engine is called here
        logger.info("Note: create_project endpoint only writes to DB. Kotlin engine/DALL-E generation are NOT called here (see /generate endpoint instead).")
        
        return {"project": project}
    except Exception as e:
        logger.error(f"Error in create_project: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal Server Error details: {str(e)}\n{traceback.format_exc()}")


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project = await service.get_project(project_id, current_user.id)
    return {"project": project}


@router.patch("/{project_id}")
async def update_project(
    project_id: str,
    req: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project = await service.update_project(project_id, current_user.id, req)
    return {"project": project}


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    return await service.delete_project(project_id, current_user.id)


@router.post("/{project_id}/duplicate", status_code=201)
async def duplicate_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project = await service.duplicate_project(project_id, current_user.id)
    return {"project": project}


@router.post("/{project_id}/generate")
async def generate_plan(
    project_id: str,
    req: Optional[dict] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project_dict = await service.get_project(project_id, current_user.id)

    from app.ai.engine import ArchitectEngine
    from app.models.room import Room
    from app.models.project import Project
    from sqlalchemy import select

    engine = ArchitectEngine()
    
    # Override defaults with user request
    req_data = req or {}
    bedrooms = req_data.get("bedrooms") or sum(1 for r in project_dict.get("rooms", []) if r.get("type") == "bedroom") or 3
    kitchens = req_data.get("kitchens", 1)
    plot_length = req_data.get("plot_length", project_dict["plot_length"])
    plot_width = req_data.get("plot_width", project_dict["plot_width"])
    facing = req_data.get("facing", project_dict["facing"])
    vastu = req_data.get("vastu", project_dict["vastu"])
    
    plan = engine.generate_plan({
        "plot_length": plot_length,
        "plot_width": plot_width,
        "facing": facing,
        "floors": project_dict["floors"],
        "budget_tier": project_dict["budget_tier"],
        "style": project_dict["style"],
        "vastu": vastu,
        "bedrooms": bedrooms,
        "bathrooms": 2, # simplified
        "kitchens": kitchens,
        "parking": 1,
        "garden": False,
    })

    for room_data in plan["rooms"]:
        room = Room(
            project_id=project_id,
            name=room_data["name"],
            width=room_data["width"],
            length=room_data["length"],
            level=room_data.get("level", 0),
            x=room_data.get("x", 0),
            y=room_data.get("y", 0),
            room_type=room_data.get("type", "room"),
            color=room_data.get("color", "#f8fafc"),
        )
        db.add(room)

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project:
        project.cost_estimate = plan["costEstimate"]
        project.vastu_score = int(plan["scores"].get("vastu_score", 0))
        project.sustainability_score = plan.get("sustainabilityScore")
        project.plot_length = plot_length
        project.plot_width = plot_width
        project.facing = facing
        project.vastu = vastu

    await db.flush()

    updated = await service.get_project(project_id, current_user.id)
    return {"project": updated, "plan": plan}
