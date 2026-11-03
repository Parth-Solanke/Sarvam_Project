import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from backend.app.models.sql.models import (
    AnalystReview, AuditLog, ExtractedEntity, ExtractedRelationship, SignalAnomaly
)
from backend.app.core.database import graph_store

class VerificationService:
    async def record_decision(
        self,
        db: AsyncSession,
        analyst_id: str,
        target_type: str,
        target_id: str,
        decision: str,
        analyst_rationale: str,
        modified_state: Optional[Dict[str, Any]] = None,
        ip_address: str = "127.0.0.1"
    ) -> AnalystReview:
        """
        Record a human analyst review and apply changes atomically.
        Maintains an immutable audit log.
        """
        prev_state = {}
        
        # 1. Fetch current state and update relational record
        if target_type == "ENTITY":
            stmt = select(ExtractedEntity).where(ExtractedEntity.id == target_id)
            res = await db.execute(stmt)
            entity = res.scalar_one_or_none()
            if entity:
                prev_state = {
                    "canonical_name": entity.canonical_name,
                    "resolution_status": entity.resolution_status
                }
                new_status = "RESOLVED" if decision == "APPROVED" else "REJECTED" if decision == "REJECTED" else "UNRESOLVED"
                entity.resolution_status = new_status
                if modified_state and "canonical_name" in modified_state:
                    entity.canonical_name = modified_state["canonical_name"]
                
                # Update graph representation
                if target_id in graph_store.local_graph:
                    graph_store.local_graph.nodes[target_id]["verification_status"] = new_status
                    if modified_state and "canonical_name" in modified_state:
                        graph_store.local_graph.nodes[target_id]["canonical_name"] = modified_state["canonical_name"]

        elif target_type == "RELATIONSHIP":
            stmt = select(ExtractedRelationship).where(ExtractedRelationship.id == target_id)
            res = await db.execute(stmt)
            rel = res.scalar_one_or_none()
            if rel:
                prev_state = {
                    "relation_type": rel.relation_type,
                    "verification_status": rel.verification_status
                }
                new_status = "VERIFIED" if decision == "APPROVED" else "REJECTED" if decision == "REJECTED" else "DISPUTED"
                rel.verification_status = new_status

        elif target_type == "SIGNAL":
            stmt = select(SignalAnomaly).where(SignalAnomaly.id == target_id)
            res = await db.execute(stmt)
            sig = res.scalar_one_or_none()
            if sig:
                prev_state = {
                    "verification_status": sig.verification_status
                }
                new_status = "VERIFIED" if decision == "APPROVED" else "REJECTED" if decision == "REJECTED" else "DISPUTED"
                sig.verification_status = new_status

        # 2. Persist the Analyst Review Record
        review = AnalystReview(
            analyst_id=analyst_id,
            target_type=target_type,
            target_id=target_id,
            decision=decision,
            previous_state_json=json.dumps(prev_state),
            modified_state_json=json.dumps(modified_state or {}),
            analyst_rationale=analyst_rationale
        )
        db.add(review)

        # 3. Create Immutable Audit Log
        audit = AuditLog(
            user_id=analyst_id,
            action=f"REVIEW_{decision}",
            resource_type=target_type,
            resource_id=target_id,
            ip_address=ip_address,
            action_payload_json=json.dumps({
                "decision": decision,
                "rationale": analyst_rationale,
                "previous_state": prev_state,
                "modified_state": modified_state or {}
            })
        )
        db.add(audit)
        
        await db.commit()
        await db.refresh(review)
        return review

verification_service = VerificationService()
