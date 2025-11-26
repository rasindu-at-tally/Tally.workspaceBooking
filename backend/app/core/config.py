"""Application configuration"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    # Use psycopg3 driver with SQLAlchemy (postgresql+psycopg)
    DATABASE_URL: str = "postgresql+psycopg://application_user:v1NVSCVXFS1Kg3@localhost:5432/officebooking"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Timezone
    DEFAULT_TIMEZONE: str = "Australia/Melbourne"
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # Microsoft Teams / Graph API
    MS_CLIENT_ID: str = "YOUR_CLIENT_ID_HERE"
    MS_CLIENT_SECRET: str = "YOUR_CLIENT_SECRET_HERE"
    MS_TENANT_ID: str = "common"
    # Default callback points to the FastAPI teams callback on port 5001
    MS_REDIRECT_URI: str = "http://localhost:5001/api/teams/callback"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


def get_settings() -> Settings:
    """Get application settings"""
    return settings


settings = Settings()


