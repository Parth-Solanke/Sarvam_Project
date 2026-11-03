import sys
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend root directory is in sys.path regardless of execution directory
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, graph_store, async_session_maker
from app.core.seeder import seed_initial_data
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("sarvosint.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("Initializing SarvOSINT Backend...")
    await init_db()
    await graph_store.connect()
    
    # Auto-seed initial analyst and test intelligence dataset & sync graph
    async with async_session_maker() as session:
        try:
            await seed_initial_data(session)
            await graph_store.sync_from_database(session)
            logger.info("Intelligence dataset and knowledge graph synchronized.")
        except Exception as e:
            logger.error("Seeder/Sync error: %s", str(e))
            
    yield
    
    # Shutdown sequence
    await graph_store.close()
    logger.info("SarvOSINT Backend shutdown cleanly.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligence Community grade SarvOSINT API with traceable knowledge graph and weak-signal analytics.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "CONNECTED",
        "graph_engine": "NEO4J" if graph_store.use_neo4j else "EMBEDDED_HYBRID",
        "sarvam_ai": "ACTIVE" if bool(settings.SARVAM_API_KEY) else "STANDBY"
    }
