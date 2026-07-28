from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.notification import NotificationUpdate
from app.services.notification_service import NotificationService
from app.models.user import User

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    return await service.get_notifications(current_user.id)


@router.patch("")
async def update_notifications(
    req: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    if req.id:
        return await service.mark_read(current_user.id, notification_id=req.id)
    return await service.mark_read(current_user.id, read_all=True)
