import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Locate backend dir and repo root
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
REPO_ROOT = BACKEND_DIR.parent

ENV_FILE = BACKEND_DIR / ".env" if (BACKEND_DIR / ".env").exists() else REPO_ROOT / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "SarvOSINT"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "sarvosint-super-secure-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Sarvam AI
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY") or os.getenv("SARVAM_API_KEY1") or os.getenv("SARVAM_API_KEY2") or ""
    
    # Databases
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./osint_workbench.db")
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "fusion_neo4j_2026")
    
    # Storage
    STORAGE_DIR: str = str(BACKEND_DIR / "storage_data")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    class Config:
        env_file = str(ENV_FILE)
        extra = "ignore"

settings = Settings()

# Ensure local storage directory exists
Path(settings.STORAGE_DIR).mkdir(parents=True, exist_ok=True)
