from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.models.sql.models import ExtractionEvidence, ExtractedRelationship, Source
from backend.app.models.schemas.schemas import EvidenceResponse

router = APIRouter(prefix="/evidence", tags=["Provenance & Verifiable Evidence"])

@router.get("/relationship/{relationship_id}", response_model=EvidenceResponse)
async def get_relationship_evidence(relationship_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve the exact source quote, character offsets, and provenance behind any relationship."""
    stmt = (
        select(ExtractionEvidence, ExtractedRelationship, Source)
        .join(ExtractedRelationship, ExtractionEvidence.relationship_id == ExtractedRelationship.id)
        .join(Source, ExtractionEvidence.source_id == Source.id)
        .where(ExtractionEvidence.relationship_id == relationship_id)
    )
    res = await db.execute(stmt)
    record = res.first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Evidence not found for this relationship")
        
    evidence, rel, source = record
    return {
        "relationship_id": rel.id,
        "relation_type": rel.relation_type,
        "source_id": source.id,
        "source_title": source.title,
        "source_uri": source.source_uri,
        "quote_verbatim": evidence.quote_verbatim,
        "quote_offset_start": evidence.quote_offset_start,
        "quote_offset_end": evidence.quote_offset_end,
        "confidence": rel.confidence,
        "verification_status": rel.verification_status
    }

