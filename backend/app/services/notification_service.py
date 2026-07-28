from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.models.notification import Notification
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_notifications(self, user_id: str, page: int = 1, per_page: int = 50) -> dict:
        query = select(Notification).where(Notification.user_id == user_id).order_by(desc(Notification.created_at))
        
        total_result = await self.db.execute(select(func.count()).select_from(query.subquery()))
        total = total_result.scalar() or 0
        
        result = await self.db.execute(query.offset((page - 1) * per_page).limit(per_page))
        notifications = result.scalars().all()
        
        return {
            "notifications": [
                {
                    "id": n.id,
                    "user_id": n.user_id,
                    "title": n.title,
                    "message": n.message,
                    "type": n.notification_type,
                    "category": n.category,
                    "is_read": n.is_read,
                    "link": n.link,
                    "created_at": n.created_at.isoformat() if n.created_at else None,
                }
                for n in notifications
            ],
            "total": total,
            "unread": sum(1 for n in notifications if not n.is_read),
        }

    async def mark_read(self, user_id: str, notification_id: str = None, read_all: bool = False):
        if read_all:
            result = await self.db.execute(
                select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
            )
            for n in result.scalars().all():
                n.is_read = True
        elif notification_id:
            result = await self.db.execute(
                select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
            )
            n = result.scalar_one_or_none()
            if n:
                n.is_read = True
        
        await self.db.flush()
        return {"success": True}

    async def create_notification(self, user_id: str, title: str, message: str,
                                   notification_type: str = "info", category: str = None, link: str = None):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            category=category,
            link=link,
        )
        self.db.add(notification)
        await self.db.flush()
        return notification
