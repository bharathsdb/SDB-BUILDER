from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.export import Export
from app.models.project import Project
from app.models.room import Room
from app.rendering.floor_plan_2d import FloorPlan2DRenderer
from app.rendering.blueprint import BlueprintRenderer
from fastapi import HTTPException, status
import os
import logging

logger = logging.getLogger(__name__)


class ExportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_export(self, user_id: str, project_id: str, export_format: str, options: dict = None) -> dict:
        result = await self.db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        export = Export(
            project_id=project_id,
            user_id=user_id,
            export_type=export_format,
            format=export_format,
            status="processing",
            options=options or {},
        )
        self.db.add(export)
        await self.db.flush()
        await self.db.refresh(export)
        
        rooms_result = await self.db.execute(select(Room).where(Room.project_id == project_id))
        rooms = rooms_result.scalars().all()
        
        try:
            file_path = await self._generate_export(project, rooms, export_format, options or {})
            export.file_path = file_path
            export.status = "completed"
            if os.path.exists(file_path):
                export.file_size = os.path.getsize(file_path)
            await self.db.flush()
        except Exception as e:
            export.status = "failed"
            await self.db.flush()
            logger.error(f"Export generation failed: {e}")
        
        return {
            "id": export.id,
            "project_id": export.project_id,
            "user_id": export.user_id,
            "type": export.export_type,
            "format": export.format,
            "file_url": f"/uploads/exports/{os.path.basename(file_path)}" if export.status == "completed" else None,
            "file_size": export.file_size,
            "status": export.status,
            "created_at": export.created_at.isoformat() if export.created_at else None,
        }

    async def get_exports(self, user_id: str) -> list:
        result = await self.db.execute(
            select(Export).where(Export.user_id == user_id).order_by(desc(Export.created_at))
        )
        exports = result.scalars().all()
        return [
            {
                "id": e.id,
                "project_id": e.project_id,
                "user_id": e.user_id,
                "type": e.export_type,
                "format": e.format,
                "file_url": f"/uploads/exports/{os.path.basename(e.file_path)}" if e.file_path else None,
                "file_size": e.file_size,
                "status": e.status,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in exports
        ]

    async def _generate_export(self, project: Project, rooms: list[Room], fmt: str, options: dict) -> str:
        export_dir = "uploads/exports"
        os.makedirs(export_dir, exist_ok=True)
        filename = f"{project.id}_{fmt}.{fmt}"
        filepath = os.path.join(export_dir, filename)
        
        if fmt == "png":
            renderer = FloorPlan2DRenderer()
            renderer.render(project, rooms, filepath)
        elif fmt == "pdf":
            renderer = BlueprintRenderer()
            renderer.render_pdf(project, rooms, filepath)
        elif fmt == "svg":
            renderer = FloorPlan2DRenderer()
            renderer.render_svg(project, rooms, filepath)
        else:
            renderer = FloorPlan2DRenderer()
            renderer.render(project, rooms, filepath.replace(f".{fmt}", ".png"))
        
        return filepath
