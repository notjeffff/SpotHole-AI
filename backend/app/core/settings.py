from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application configuration parsed from environment variables.
    """
    PROJECT_NAME: str = "SpotHole AI Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    
    # Database configuration
    DATABASE_URL: str = "sqlite:///./data/spothole.db"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

# Global settings instance
settings = Settings()
