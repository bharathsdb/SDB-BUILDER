from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.project_service import ProjectService

router = APIRouter(prefix="/api/plans", tags=["Plans"])


@router.get("")
async def get_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    projects = await service.get_projects(current_user.id, status="completed")
    return {"plans": projects.get("projects", [])}
