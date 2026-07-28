"""
PlanCraftAI - Python Backend Entry Point
FastAPI application with all routers, middleware, and startup/shutdown hooks.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import get_settings
from app.database import init_db, close_db

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting PlanCraftAI backend...")
    try:
        await init_db()
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.warning(f"Database initialization skipped (may already exist): {e}")
    yield
    await close_db()
    logger.info("PlanCraftAI backend shut down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
import os
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Import and include routers
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.payments import router as payments_router
from app.api.ai_routes import router as ai_router
from app.api.exports import router as exports_router
from app.api.notifications import router as notifications_router
from app.api.settings import router as settings_router
from app.api.plans import router as plans_router
from app.api.admin import router as admin_router
from app.api.marketplace import router as marketplace_router
from app.api.team import router as team_router
from app.api.cv_routes import router as cv_router
from app.api.render import router as render_router
from app.api.image_to_3d import router as image_to_3d_router
from app.api.ai_image_routes import router as ai_image_router

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(payments_router)
app.include_router(ai_router)
app.include_router(exports_router)
app.include_router(notifications_router)
app.include_router(settings_router)
app.include_router(plans_router)
app.include_router(admin_router)
app.include_router(marketplace_router)
app.include_router(team_router)
app.include_router(cv_router)
app.include_router(render_router)
app.include_router(image_to_3d_router)
app.include_router(ai_image_router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "service": settings.APP_NAME,
    }


@app.get("/")
async def root():
    return {
        "message": "PlanCraftAI Backend",
        "version": settings.VERSION,
        "docs": "/api/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
