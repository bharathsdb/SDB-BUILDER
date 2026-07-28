"""
Celery Worker Configuration
Handles background tasks: exports, rendering, notifications, image processing.
"""
from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "plancraftai",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    worker_max_tasks_per_child=200,
)


@celery_app.task(bind=True, max_retries=3)
def generate_export_task(self, project_id: str, export_format: str, user_id: str):
    """Background task for generating exports."""
    try:
        from app.database import async_session_factory
        from app.services.export_service import ExportService
        import asyncio

        async def run():
            async with async_session_factory() as db:
                service = ExportService(db)
                return await service.create_export(user_id, project_id, export_format)

        loop = asyncio.new_event_loop()
        result = loop.run_until_complete(run())
        loop.close()
        return result
    except Exception as exc:
        self.retry(exc=exc, countdown=60)


@celery_app.task(bind=True, max_retries=3)
def generate_3d_model_task(self, project_id: str, rooms_data: str):
    """Background task for 3D model generation."""
    try:
        import json
        from app.rendering.three_d_gen import ThreeDGenerator

        rooms = json.loads(rooms_data)
        gen = ThreeDGenerator()
        glb_bytes = gen.generate_glb(rooms)

        import os
        output_path = f"uploads/models/{project_id}.glb"
        os.makedirs("uploads/models", exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(glb_bytes)

        return {"success": True, "path": output_path}
    except Exception as exc:
        self.retry(exc=exc, countdown=60)


@celery_app.task
def send_notification_task(user_id: str, title: str, message: str, notification_type: str = "info"):
    """Background task for sending notifications."""
    try:
        from app.database import async_session_factory
        from app.services.notification_service import NotificationService
        import asyncio

        async def run():
            async with async_session_factory() as db:
                service = NotificationService(db)
                await service.create_notification(user_id, title, message, notification_type)

        loop = asyncio.new_event_loop()
        loop.run_until_complete(run())
        loop.close()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Notification task failed: {e}")


@celery_app.task(bind=True, max_retries=3)
def process_image_task(self, file_path: str):
    """Background task for image processing."""
    try:
        import cv2
        import numpy as np

        img = cv2.imread(file_path)
        if img is None:
            return {"success": False, "error": "Could not read image"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        enhanced = cv2.equalizeHist(gray)
        denoised = cv2.fastNlMeansDenoising(enhanced, None, 10, 7, 21)

        output_path = file_path.replace(".", "_enhanced.")
        cv2.imwrite(output_path, denoised)

        return {"success": True, "output": output_path}
    except Exception as e:
        return {"success": False, "error": str(e)}


@celery_app.task(bind=True, max_retries=3)
def image_to_plan_task(self, job_id: str, file_path: str, image_type: str, project_id: str = None, user_id: str = None):
    """Background task for full image-to-plan analysis."""
    try:
        import asyncio
        from app.database import async_session_factory
        from app.models.render_job import RenderJob
        from app.models.floor_plan import FloorPlan
        from app.ai.image_to_plan import ImageToPlanPipeline

        async def update_status(status: str, progress: float, output_urls: dict = None):
            async with async_session_factory() as db:
                from sqlalchemy import select
                result = await db.execute(select(RenderJob).where(RenderJob.id == job_id))
                job = result.scalar_one_or_none()
                if job:
                    job.status = status
                    job.progress = progress
                    if output_urls:
                        job.output_urls = output_urls
                    await db.commit()

        loop = asyncio.new_event_loop()
        loop.run_until_complete(update_status("processing", 5.0))

        with open(file_path, "rb") as f:
            image_bytes = f.read()

        pipeline = ImageToPlanPipeline()
        result = pipeline.analyze(image_bytes, image_type)

        if not result.get("success"):
            loop.run_until_complete(update_status("failed", 0.0))
            loop.close()
            return {"success": False, "error": result.get("error", "Analysis failed")}

        loop.run_until_complete(update_status("processing", 80.0))

        urls = {
            "processedImage": result.get("processedImage"),
            "processedSvg": result.get("processedSvg"),
            "glbBase64": result.get("glbBase64"),
            "scene": result.get("scene"),
            "elevations": result.get("elevations", {}),
        }

        # Save floor plan if project_id provided
        if project_id and user_id:
            from app.models.room import Room
            async def save_plan():
                async with async_session_factory() as db:
                    floor_plan = FloorPlan(
                        project_id=project_id,
                        name=f"AI Generated ({image_type})",
                        version=1,
                        data={
                            "rooms": result.get("rooms", []),
                            "walls": result.get("walls", []),
                            "doors": result.get("doors", []),
                            "windows": result.get("windows", []),
                            "source_type": image_type,
                            "confidence_scores": result.get("confidence_scores", {}),
                        },
                        is_active=True,
                    )
                    db.add(floor_plan)
                    await db.commit()
            loop.run_until_complete(save_plan())

        loop.run_until_complete(update_status("completed", 100.0, urls))
        loop.close()

        return {"success": True, "result": result}
    except Exception as exc:
        import asyncio
        loop = asyncio.new_event_loop()
        try:
            from app.database import async_session_factory
            from app.models.render_job import RenderJob
            from sqlalchemy import select
            async def fail_job():
                async with async_session_factory() as db:
                    result = await db.execute(select(RenderJob).where(RenderJob.id == job_id))
                    job = result.scalar_one_or_none()
                    if job:
                        job.status = "failed"
                        job.progress = 0.0
                        await db.commit()
            loop.run_until_complete(fail_job())
        except:
            pass
        loop.close()
        self.retry(exc=exc, countdown=60)


@celery_app.task(bind=True, max_retries=3)
def render_2d_blueprint_task(self, job_id: str, project_id: str, rooms_data: str, user_id: str):
    """Background task for HD 2D Blueprint generation."""
    try:
        import json
        import os
        from app.database import async_session_factory
        from app.models.render_job import RenderJob
        from app.rendering.floor_plan_2d import FloorPlan2DRenderer
        import asyncio

        rooms = json.loads(rooms_data)

        async def update_status(status: str, progress: float, output_urls: dict = None):
            async with async_session_factory() as db:
                from sqlalchemy import select
                result = await db.execute(select(RenderJob).where(RenderJob.id == job_id))
                job = result.scalar_one_or_none()
                if job:
                    job.status = status
                    job.progress = progress
                    if output_urls:
                        job.output_urls = output_urls
                    await db.commit()

        loop = asyncio.new_event_loop()
        loop.run_until_complete(update_status("processing", 10.0))

        # Generate PNG and SVG
        output_dir = f"uploads/renders/{project_id}"
        os.makedirs(output_dir, exist_ok=True)
        
        png_path = f"{output_dir}/blueprint_2d.png"
        svg_path = f"{output_dir}/blueprint_2d.svg"

        class DummyProject:
            def __init__(self):
                self.plot_width = 40.0
                self.plot_length = 60.0
                self.name = "PlanCraftAI Project"

        class DummyRoom:
            def __init__(self, d):
                self.x = d.get("x", 0.0)
                self.y = d.get("y", 0.0)
                self.width = d.get("width", 10.0)
                self.length = d.get("length", 10.0)
                self.name = d.get("name", "Room")
                self.room_type = d.get("type", "default")

        dummy_project = DummyProject()
        room_objects = [DummyRoom(r) for r in rooms]

        renderer = FloorPlan2DRenderer(scale=10.0) # High scale for HD
        loop.run_until_complete(update_status("processing", 40.0))
        
        renderer.render(dummy_project, room_objects, png_path)
        loop.run_until_complete(update_status("processing", 70.0))
        
        renderer.render_svg(dummy_project, room_objects, svg_path)

        urls = {
            "png": f"/{png_path}",
            "svg": f"/{svg_path}"
        }
        loop.run_until_complete(update_status("completed", 100.0, urls))
        loop.close()

        return {"success": True, "urls": urls}
    except Exception as exc:
        import asyncio
        loop = asyncio.new_event_loop()
        loop.run_until_complete(update_status("failed", 0.0))
        loop.close()
        self.retry(exc=exc, countdown=60)


@celery_app.task(bind=True, max_retries=3)
def render_3d_scene_task(self, job_id: str, project_id: str, rooms_data: str, user_id: str, view_type: str = "exterior"):
    """Background task for 3D Render generation (PBR)."""
    try:
        import json
        import os
        from app.database import async_session_factory
        from app.models.render_job import RenderJob
        from app.rendering.three_d_gen import ThreeDGenerator
        import asyncio

        rooms = json.loads(rooms_data)

        async def update_status(status: str, progress: float, output_urls: dict = None):
            async with async_session_factory() as db:
                from sqlalchemy import select
                result = await db.execute(select(RenderJob).where(RenderJob.id == job_id))
                job = result.scalar_one_or_none()
                if job:
                    job.status = status
                    job.progress = progress
                    if output_urls:
                        job.output_urls = output_urls
                    await db.commit()

        loop = asyncio.new_event_loop()
        loop.run_until_complete(update_status("processing", 10.0))

        # 3D generation logic
        output_dir = f"uploads/renders/{project_id}"
        os.makedirs(output_dir, exist_ok=True)
        
        glb_path = f"{output_dir}/model.glb"
        
        gen = ThreeDGenerator()
        glb_bytes = gen.generate_glb(rooms)
        
        with open(glb_path, "wb") as f:
            f.write(glb_bytes)
            
        loop.run_until_complete(update_status("processing", 50.0))
        
        # Here we would normally invoke Open3D or PyTorch for PBR rendering
        # For now, we simulate the high-quality render by creating a placeholder output
        render_path = f"{output_dir}/render_{view_type}.png"
        
        # Simulated PBR render wait time
        import time
        time.sleep(2)
        
        # Copy a placeholder image or create a blank one
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (1920, 1080), (40, 40, 40))
        d = ImageDraw.Draw(img)
        d.text((800, 500), f"Simulated {view_type.capitalize()} Render", fill=(200, 200, 200))
        img.save(render_path)

        urls = {
            "glb": f"/{glb_path}",
            "render": f"/{render_path}"
        }
        loop.run_until_complete(update_status("completed", 100.0, urls))
        loop.close()

        return {"success": True, "urls": urls}
    except Exception as exc:
        import asyncio
        loop = asyncio.new_event_loop()
        loop.run_until_complete(update_status("failed", 0.0))
        loop.close()
        self.retry(exc=exc, countdown=60)
