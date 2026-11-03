from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.sources import router as sources_router
from backend.app.api.v1.entities import router as entities_router
from backend.app.api.v1.graph import router as graph_router
from backend.app.api.v1.evidence import router as evidence_router
from backend.app.api.v1.signals import router as signals_router
from backend.app.api.v1.verification import router as verification_router
from backend.app.api.v1.reports import router as reports_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(sources_router)
api_router.include_router(entities_router)
api_router.include_router(graph_router)
api_router.include_router(evidence_router)
api_router.include_router(signals_router)
api_router.include_router(verification_router)
api_router.include_router(reports_router)

