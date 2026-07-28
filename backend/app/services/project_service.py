from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.user import User
from app.models.project import Project
from app.models.room import Room
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.utils.helpers import generate_share_url
from fastapi import HTTPException, status
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_project(self, user_id: str, req: ProjectCreate) -> dict:
        project = Project(
            user_id=user_id,
            name=req.name or f"Project {len(await self._get_user_project_count(user_id)) + 1}",
            description=req.description or "",
            plot_length=req.plot_length,
            plot_width=req.plot_width,
            facing=req.facing,
            floor_count=req.floors,
            budget_tier=req.budget_tier,
            style=req.style,
            vastu=req.vastu,
            share_url=generate_share_url(),
        )
        self.db.add(project)
        await self.db.flush()
        await self.db.refresh(project)
        
        await self._increment_project_count(user_id)
        
        return await self._project_to_dict(project)

    async def get_projects(self, user_id: str, page: int = 1, per_page: int = 20,
                           status: Optional[str] = None) -> dict:
        query = select(Project).where(Project.user_id == user_id)
        if status:
            query = query.where(Project.status == status)
        query = query.order_by(desc(Project.updated_at))
        
        total = await self.db.execute(select(func.count()).select_from(query.subquery()))
        total_count = total.scalar() or 0
        
        result = await self.db.execute(query.offset((page - 1) * per_page).limit(per_page))
        projects = result.scalars().all()
        
        return {
            "projects": [await self._project_to_dict(p) for p in projects],
            "total": total_count,
            "page": page,
            "per_page": per_page,
        }

    async def get_project(self, project_id: str, user_id: str) -> dict:
        result = await self.db.execute(
            select(Project).where(Project.id == project_id, Project.user_id == user_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return await self._project_to_dict(project)

    async def update_project(self, project_id: str, user_id: str, req: ProjectUpdate) -> dict:
        result = await self.db.execute(
            select(Project).where(Project.id == project_id, Project.user_id == user_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)
        
        await self.db.flush()
        await self.db.refresh(project)
        return await self._project_to_dict(project)

    async def delete_project(self, project_id: str, user_id: str) -> dict:
        result = await self.db.execute(
            select(Project).where(Project.id == project_id, Project.user_id == user_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        await self.db.delete(project)
        await self.db.flush()
        return {"success": True}

    async def duplicate_project(self, project_id: str, user_id: str) -> dict:
        result = await self.db.execute(
            select(Project).where(Project.id == project_id, Project.user_id == user_id)
        )
        original = result.scalar_one_or_none()
        if not original:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        import copy
        new_project = Project(
            user_id=user_id,
            name=f"{original.name} (Copy)",
            description=original.description,
            plot_length=original.plot_length,
            plot_width=original.plot_width,
            facing=original.facing,
            floor_count=original.floor_count,
            budget_tier=original.budget_tier,
            style=original.style,
            vastu=original.vastu,
            share_url=generate_share_url(),
        )
        self.db.add(new_project)
        await self.db.flush()
        await self.db.refresh(new_project)
        return await self._project_to_dict(new_project)

    async def _get_user_project_count(self, user_id: str) -> list:
        result = await self.db.execute(select(Project).where(Project.user_id == user_id))
        return result.scalars().all()

    async def _increment_project_count(self, user_id: str):
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.projects_count += 1
            await self.db.flush()

    async def _project_to_dict(self, project: Project) -> dict:
        rooms_result = await self.db.execute(
            select(Room).where(Room.project_id == project.id)
        )
        rooms = rooms_result.scalars().all()
        
        return {
            "id": project.id,
            "user_id": project.user_id,
            "name": project.name,
            "description": project.description,
            "plot_length": project.plot_length,
            "plot_width": project.plot_width,
            "facing": project.facing,
            "floors": project.floor_count,
            "budget_tier": project.budget_tier,
            "style": project.style,
            "vastu": project.vastu,
            "status": project.status,
            "shared": project.shared,
            "share_url": project.share_url,
            "view_count": project.view_count,
            "vastu_score": project.vastu_score,
            "sustainability_score": project.sustainability_score,
            "stars": project.stars,
            "tags": project.tags,
            "thumbnail": project.thumbnail,
            "cost_estimate": project.cost_estimate,
            "rooms": [
                {
                    "id": r.id,
                    "name": r.name,
                    "width": r.width,
                    "length": r.length,
                    "level": r.level,
                    "type": r.room_type,
                    "x": r.x,
                    "y": r.y,
                    "color": r.color,
                }
                for r in rooms
            ],
            "created_at": project.created_at.isoformat() if project.created_at else None,
            "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        }
