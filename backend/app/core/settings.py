from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    """
    Application configuration parsed from environment variables.
    """
    PROJECT_NAME: str = "SpotHole AI Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    
    # AI Config
    YOLO_MODEL_PATH: str = "yolov8n.pt"
    MATCH_RADIUS_METERS: float = 15.0
    CONFIDENCE_THRESHOLD: float = 0.85
    FRAME_INTERVAL: int = 1
    
    # Database configuration
    DATABASE_URL: str = "sqlite:///./data/spothole.db"
    
    # CORS Config
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

# Global settings instance
settings = Settings()
