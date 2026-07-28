from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.export import ExportRequest
from app.services.export_service import ExportService
from app.models.user import User

router = APIRouter(prefix="/api/exports", tags=["Exports"])


@router.post("")
async def create_export(
    req: ExportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ExportService(db)
    return await service.create_export(current_user.id, req.project_id, req.format, req.options)


@router.get("")
async def list_exports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ExportService(db)
    exports = await service.get_exports(current_user.id)
    return {"exports": exports}
