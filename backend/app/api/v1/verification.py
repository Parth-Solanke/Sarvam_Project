import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.models.sql.models import (
    ExtractedEntity, ExtractedRelationship, ExtractionEvidence, AuditLog, User
)
from backend.app.models.schemas.schemas import (
    VerificationDecisionRequest, AuditLogResponse
)
from backend.app.api.v1.auth import get_current_user
from backend.app.services.verification.workflow import verification_service

router = APIRouter(prefix="/verification", tags=["Human Analyst Verification & Audit"])

@router.get("/queue")
async def get_verification_queue(db: AsyncSession = Depends(get_db)):
    """Fetch unverified entities and relationships pending analyst review."""
    # 1. Unverified relationships
    rel_stmt = (
        select(ExtractedRelationship, ExtractionEvidence)
        .outerjoin(ExtractionEvidence, ExtractedRelationship.id == ExtractionEvidence.relationship_id)
        .where(ExtractedRelationship.verification_status == "UNVERIFIED")
        .limit(30)
    )
    rel_res = await db.execute(rel_stmt)
    pending_relationships = []
    
    for rel, evidence in rel_res.all():
        # Get source and target names
        e1_stmt = select(ExtractedEntity.canonical_name).where(ExtractedEntity.id == rel.source_entity_id)
        e2_stmt = select(ExtractedEntity.canonical_name).where(ExtractedEntity.id == rel.target_entity_id)
        e1_name = (await db.execute(e1_stmt)).scalar() or rel.source_entity_id
        e2_name = (await db.execute(e2_stmt)).scalar() or rel.target_entity_id
        
        pending_relationships.append({
            "id": rel.id,
            "target_type": "RELATIONSHIP",
            "source_entity": e1_name,
            "target_entity": e2_name,
            "relation_type": rel.relation_type,
            "confidence": rel.confidence,
            "quote": evidence.quote_verbatim if evidence else "Direct observation",
            "created_at": rel.created_at.isoformat()
        })

    # 2. Unresolved entities
    ent_stmt = select(ExtractedEntity).where(ExtractedEntity.resolution_status == "UNRESOLVED").limit(30)
    ent_res = await db.execute(ent_stmt)
    pending_entities = [
        {
            "id": e.id,
            "target_type": "ENTITY",
            "canonical_name": e.canonical_name,
            "entity_type": e.entity_type,
            "confidence": e.confidence_score,
            "aliases": json.loads(e.aliases_json or "[]"),
            "created_at": e.created_at.isoformat()
        }
        for e in ent_res.scalars().all()
    ]

    return {
        "pending_relationships": pending_relationships,
        "pending_entities": pending_entities,
        "total_pending": len(pending_relationships) + len(pending_entities)
    }

@router.post("/review")
async def submit_review(
    req: VerificationDecisionRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit human review decision (Approve/Reject/Modify) with mandatory rationale."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    review = await verification_service.record_decision(
        db=db,
        analyst_id=current_user.id,
        target_type=req.target_type,
        target_id=req.target_id,
        decision=req.decision,
        analyst_rationale=req.analyst_rationale,
        modified_state=req.modified_state,
        ip_address=client_ip
    )
    return {"status": "SUCCESS", "review_id": review.id, "decision": req.decision}

@router.get("/audit-log")
async def get_audit_log(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Fetch the immutable append-only audit log."""
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    res = await db.execute(stmt)
    records = res.scalars().all()
    
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "action": a.action,
            "resource_type": a.resource_type,
            "resource_id": a.resource_id,
            "ip_address": a.ip_address,
            "action_payload": json.loads(a.action_payload_json or "{}"),
            "timestamp": a.timestamp.isoformat()
        }
        for a in records
    ]

