from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    APP_NAME: str = "PlanCraftAI"
    VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./plancraft.db"
    DATABASE_URL_SYNC: str = "sqlite:///./plancraft.db"
    
    JWT_SECRET: str = "plancraft-ai-jwt-secret-dev-2025"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 7
    JWT_REFRESH_EXPIRATION: int = 30
    
    MASTER_KEY: str = "default-master-key-change-me"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    PAYTM_MID: str = "PLANCR87329847128943"
    PAYTM_MERCHANT_KEY: str = "SampleMerchantKey12345"
    PAYTM_ENVIRONMENT: str = "stage"
    PAYTM_WEBSITE: str = "DEFAULT"
    PAYTM_INDUSTRY_TYPE: str = "Retail"
    PAYTM_CHANNEL_ID: str = "WEB"
    PAYTM_CALLBACK_URL: str = "http://localhost:8000/api/payments/paytm/verify"
    
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 50
    
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001", "https://plancraftai.vercel.app"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
