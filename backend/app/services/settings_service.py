from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.settings import Settings
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)


class SettingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_settings(self, user_id: str) -> dict:
        result = await self.db.execute(select(Settings).where(Settings.user_id == user_id))
        settings = result.scalar_one_or_none()
        if not settings:
            settings = Settings(user_id=user_id)
            self.db.add(settings)
            await self.db.flush()
            await self.db.refresh(settings)
        
        return {
            "id": settings.id,
            "user_id": settings.user_id,
            "theme": settings.theme,
            "language": settings.language,
            "units": settings.units,
            "notifications_enabled": settings.notifications_enabled,
            "email_notifications": settings.email_notifications,
        }

    async def update_settings(self, user_id: str, updates: dict) -> dict:
        result = await self.db.execute(select(Settings).where(Settings.user_id == user_id))
        settings = result.scalar_one_or_none()
        if not settings:
            settings = Settings(user_id=user_id)
            self.db.add(settings)
            await self.db.flush()
            await self.db.refresh(settings)
        
        for key, value in updates.items():
            if value is not None and hasattr(settings, key):
                setattr(settings, key, value)
        
        await self.db.flush()
        return await self.get_settings(user_id)
