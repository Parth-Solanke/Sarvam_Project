import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db, graph_store
from app.models.sql.models import (
    ExtractedEntity, EntityMention, ExtractedRelationship, ExtractionEvidence, Source, User
)
from app.models.schemas.schemas import EntityResponse, EntityResolveRequest
from app.api.v1.auth import get_current_user
from app.services.verification.workflow import verification_service

router = APIRouter(prefix="/entities", tags=["Entity Intelligence & Profiles"])

@router.get("", response_model=List[EntityResponse])
async def list_entities(
    entity_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ExtractedEntity)
    if entity_type:
        stmt = stmt.where(ExtractedEntity.entity_type == entity_type)
    if search:
        stmt = stmt.where(ExtractedEntity.canonical_name.ilike(f"%{search}%"))
    stmt = stmt.order_by(ExtractedEntity.canonical_name).limit(limit)
    
    res = await db.execute(stmt)
    entities = res.scalars().all()
    
    result = []
    for e in entities:
        m_stmt = select(func.count(EntityMention.id)).where(EntityMention.entity_id == e.id)
        count = (await db.execute(m_stmt)).scalar() or 0
        result.append({
            "id": e.id,
            "canonical_name": e.canonical_name,
            "entity_type": e.entity_type,
            "original_script_name": e.original_script_name,
            "aliases": json.loads(e.aliases_json or "[]"),
            "confidence_score": e.confidence_score,
            "resolution_status": e.resolution_status,
            "mention_count": count
        })
    return result

@router.get("/{entity_id}")
async def get_entity_profile(entity_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(ExtractedEntity).where(ExtractedEntity.id == entity_id)
    res = await db.execute(stmt)
    entity = res.scalar_one_or_none()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    # Mentions & Sources
    m_stmt = (
        select(EntityMention, Source.title, Source.source_type, Source.publication_date)
        .join(Source, EntityMention.source_id == Source.id)
        .where(EntityMention.entity_id == entity_id)
    )
    m_res = await db.execute(m_stmt)
    mentions_data = []
    for mention, title, s_type, pub_date in m_res.all():
        mentions_data.append({
            "id": mention.id,
            "source_id": mention.source_id,
            "source_title": title,
            "source_type": s_type,
            "raw_mention": mention.raw_mention,
            "char_start": mention.char_start,
            "char_end": mention.char_end,
            "publication_date": pub_date.isoformat() if pub_date else None
        })

    # Subgraph for this entity
    subgraph = await graph_store.get_subgraph(center_id=entity_id, radius=2)

    return {
        "id": entity.id,
        "canonical_name": entity.canonical_name,
        "entity_type": entity.entity_type,
        "aliases": json.loads(entity.aliases_json or "[]"),
        "confidence_score": entity.confidence_score,
        "resolution_status": entity.resolution_status,
        "mentions": mentions_data,
        "subgraph": subgraph
    }

@router.post("/resolve")
async def resolve_entity_duplicate(
    req: EntityResolveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resolve/merge an ambiguous entity alias into a verified canonical entity with analyst rationale."""
    review = await verification_service.record_decision(
        db=db,
        analyst_id=current_user.id,
        target_type="ENTITY",
        target_id=req.source_entity_id,
        decision="APPROVED",
        analyst_rationale=f"Resolved into canonical ID {req.target_canonical_id}: {req.analyst_rationale}",
        modified_state={"resolved_canonical_id": req.target_canonical_id}
    )
    return {"status": "SUCCESS", "review_id": review.id}

