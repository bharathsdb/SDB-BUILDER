"""
Database Seeder - Creates initial data for development.
"""
import asyncio
from app.database import async_session_factory, init_db
from app.utils.security import hash_password
from app.models.user import User
from app.models.subscription import SubscriptionPlan
from app.models.settings import Settings
from app.models.template import Template
from app.models.project import Project
from app.models.room import Room
from app.models.notification import Notification
from sqlalchemy import select
import uuid
import logging

logger = logging.getLogger(__name__)


async def seed():
    await init_db()
    async with async_session_factory() as db:
        # Check if already seeded
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            logger.info("Database already seeded, skipping.")
            return
        
        # Create admin user
        admin = User(
            id=uuid.uuid4(),
            name="Admin",
            email="admin@plancraft.ai",
            password=hash_password("Admin123"),
            role="super_admin",
            plan="enterprise",
            verified=True,
            is_active=True,
            ai_credits_total=999999,
            storage_quota_mb=999999,
        )
        db.add(admin)
        
        # Create demo user
        demo = User(
            id=uuid.uuid4(),
            name="Demo User",
            email="bharathsdb1@gmail.com",
            password=hash_password("bharath@22"),
            role="user",
            plan="pro",
            verified=True,
            is_active=True,
            ai_credits_total=100,
            storage_quota_mb=10240,
        )
        db.add(demo)
        
        # Create subscription plans
        plans = [
            SubscriptionPlan(name="free", price_monthly=0, price_yearly=0, credits=5, storage_mb=500, max_projects=3,
                             features={"ai_generation": True, "basic_exports": True, "community_access": True}),
            SubscriptionPlan(name="pro", price_monthly=2499, price_yearly=24990, credits=100, storage_mb=10240, max_projects=50,
                             features={"ai_generation": True, "hd_exports": True, "vastu_analysis": True, "priority_support": True}),
            SubscriptionPlan(name="business", price_monthly=7999, price_yearly=79990, credits=500, storage_mb=51200, max_projects=200,
                             features={"ai_generation": True, "team_collaboration": True, "api_access": True, "custom_templates": True}),
            SubscriptionPlan(name="enterprise", price_monthly=19999, price_yearly=199990, credits=2000, storage_mb=512000, max_projects=9999,
                             features={"all_features": True, "dedicated_support": True, "white_label": True, "custom_integrations": True}),
        ]
        for plan in plans:
            db.add(plan)
        
        # Create demo project
        project_id = uuid.uuid4()
        project = Project(
            id=project_id,
            name="My Dream Home",
            description="A modern 3BHK home with Vastu compliance",
            user_id=demo.id,
            plot_length=60,
            plot_width=40,
            facing="East",
            floor_count=2,
            budget_tier="Premium",
            style="Modern",
            vastu=True,
            status="completed",
        )
        db.add(project)
        
        # Create rooms for demo project
        rooms_data = [
            ("Master Bedroom", 14, 16, 0, "bedroom", "#e0f2fe"),
            ("Bedroom 2", 12, 14, 0, "bedroom", "#faf5ff"),
            ("Bedroom 3", 12, 14, 1, "bedroom", "#faf5ff"),
            ("Living Room", 16, 22, 0, "living", "#f0fdf4"),
            ("Dining Room", 12, 14, 0, "dining", "#fef3c7"),
            ("Kitchen", 10, 12, 0, "kitchen", "#fee2e2"),
            ("Bathroom 1", 6, 8, 0, "bathroom", "#f1f5f9"),
            ("Bathroom 2", 6, 8, 1, "bathroom", "#f1f5f9"),
            ("Pooja Room", 6, 6, 0, "pooja", "#fef3c7"),
        ]
        for name, w, l, level, rtype, color in rooms_data:
            room = Room(project_id=project_id, name=name, width=w, length=l,
                        level=level, room_type=rtype, color=color)
            db.add(room)
        
        # Create templates
        templates = [
            Template(name="Modern 3BHK", description="Contemporary 3-bedroom home with open floor plan",
                     category="residential", is_premium=False,
                     data={"bedrooms": 3, "style": "Modern", "area": 1800}),
            Template(name="Premium Villa", description="Luxury villa with pool and garden",
                     category="residential", is_premium=True, price=2499,
                     data={"bedrooms": 4, "style": "Contemporary", "area": 3500}),
            Template(name="Small Office", description="Efficient office space for small teams",
                     category="commercial", is_premium=False,
                     data={"type": "office", "area": 1200}),
        ]
        for t in templates:
            db.add(t)
        
        await db.flush()
        logger.info("Database seeded successfully!")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(seed())
