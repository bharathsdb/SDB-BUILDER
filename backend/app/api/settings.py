from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.settings import SettingsUpdate
from app.services.settings_service import SettingsService
from app.models.user import User

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("")
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SettingsService(db)
    settings = await service.get_settings(current_user.id)
    return {"settings": settings}


@router.patch("")
async def update_settings(
    req: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SettingsService(db)
    settings = await service.update_settings(current_user.id, req.model_dump(exclude_unset=True))
    return {"settings": settings}
