import hashlib
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.app.core.database import get_db, graph_store
from backend.app.models.sql.models import (
    Source, SourceChunk, ExtractedEntity, EntityMention,
    ExtractedRelationship, ExtractionEvidence, AuditLog, User
)
from backend.app.models.schemas.schemas import SourceIngestRequest, SourceResponse, SourceDetailResponse
from backend.app.services.nlp.multilingual import multilingual_service
from backend.app.services.nlp.extractor import entity_extractor
from backend.app.api.v1.auth import get_current_user

router = APIRouter(prefix="/sources", tags=["Intelligence Ingestion & Sources"])

@router.post("/ingest", response_model=SourceResponse)
async def ingest_source(
    req: SourceIngestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ingest a source document or text report and execute the end-to-end extraction pipeline."""
    # 1. Compute Cryptographic SHA-256 for Content Integrity
    content_bytes = req.content.encode("utf-8")
    content_hash = hashlib.sha256(content_bytes).hexdigest()
    
    # Check for existing duplicate source
    existing_stmt = select(Source).where(Source.content_sha256 == content_hash)
    existing_res = await db.execute(existing_stmt)
    existing_source = existing_res.scalar_one_or_none()
    if existing_source:
        return existing_source

    # 2. Multilingual Processing & Language Detection
    detected_lang = multilingual_service.detect_language(req.content)
    
    # 3. Create Persistent Source Record
    source = Source(
        title=req.title,
        source_type=req.source_type,
        source_uri=req.source_uri,
        content_sha256=content_hash,
        original_language=detected_lang,
        status="PROCESSING",
        publication_date=req.publication_date or datetime.now(timezone.utc),
        metadata_json=json.dumps({"ingested_by": current_user.email})
    )
    db.add(source)
    await db.flush()

    # 4. Logical Chunking with Preserved Character Offsets
    chunks_meta = multilingual_service.chunk_document(req.content)
    created_chunks = []
    for c in chunks_meta:
        translated_text, trans_conf = multilingual_service.translate_to_english(c["raw_text"], detected_lang)
        chunk = SourceChunk(
            source_id=source.id,
            chunk_index=c["chunk_index"],
            raw_text=c["raw_text"],
            translated_text=translated_text,
            chunk_language=detected_lang,
            char_offset_start=c["char_offset_start"],
            char_offset_end=c["char_offset_end"]
        )
        db.add(chunk)
        created_chunks.append(chunk)
    await db.flush()

    # 5. Extract Named Entities & Verifiable Relationships
    extraction_results = entity_extractor.extract_with_sarvam(req.content)
    
    # Track entities created or resolved
    name_to_entity_id = {}
    
    for ent_data in extraction_results.get("entities", []):
        c_name = ent_data["name"]
        ent_type = ent_data.get("type", "ORGANIZATION")
        conf = ent_data.get("confidence", 0.9)
        
        # Check if canonical entity already exists
        ent_stmt = select(ExtractedEntity).where(ExtractedEntity.canonical_name == c_name)
        ent_res = await db.execute(ent_stmt)
        entity = ent_res.scalar_one_or_none()
        
        if not entity:
            entity = ExtractedEntity(
                canonical_name=c_name,
                entity_type=ent_type,
                confidence_score=conf,
                resolution_status="RESOLVED"
            )
            db.add(entity)
            await db.flush()
            
            # Sync to Knowledge Graph
            await graph_store.add_node(
                node_id=entity.id,
                label=ent_type,
                properties={
                    "canonical_name": c_name,
                    "entity_type": ent_type,
                    "confidence": conf,
                    "verification_status": "VERIFIED"
                }
            )
            
        name_to_entity_id[c_name] = entity.id

        # Record Specific Mention with Source Offset
        mention = EntityMention(
            entity_id=entity.id,
            source_id=source.id,
            chunk_id=created_chunks[0].id if created_chunks else None,
            raw_mention=c_name,
            char_start=ent_data.get("char_start", 0),
            char_end=ent_data.get("char_end", len(c_name)),
            confidence=conf
        )
        db.add(mention)

    # 6. Extract Relationships with Verbatim Quotes
    for rel_data in extraction_results.get("relationships", []):
        s_name = rel_data.get("source")
        t_name = rel_data.get("target")
        r_type = rel_data.get("relation", "RELATED_TO")
        quote = rel_data.get("quote", req.content[:150])
        r_conf = rel_data.get("confidence", 0.85)

        s_id = name_to_entity_id.get(s_name)
        t_id = name_to_entity_id.get(t_name)

        if s_id and t_id and s_id != t_id:
            relationship = ExtractedRelationship(
                source_entity_id=s_id,
                target_entity_id=t_id,
                relation_type=r_type,
                confidence=r_conf,
                verification_status="UNVERIFIED"
            )
            db.add(relationship)
            await db.flush()

            evidence = ExtractionEvidence(
                relationship_id=relationship.id,
                source_id=source.id,
                chunk_id=created_chunks[0].id if created_chunks else None,
                quote_verbatim=quote,
                quote_offset_start=rel_data.get("char_start", 0),
                quote_offset_end=rel_data.get("char_end", len(quote)),
                extraction_confidence=r_conf
            )
            db.add(evidence)

            # Sync Relationship to Knowledge Graph
            await graph_store.add_relationship(
                source_id=s_id,
                target_id=t_id,
                rel_type=r_type,
                properties={
                    "relationship_id": relationship.id,
                    "confidence": r_conf,
                    "quote": quote,
                    "source_id": source.id,
                    "source_title": source.title,
                    "verification_status": "UNVERIFIED"
                }
            )

    source.status = "INDEXED"
    
    # 7. Audit Log Entry
    audit = AuditLog(
        user_id=current_user.id,
        action="INGEST_SOURCE",
        resource_type="SOURCE",
        resource_id=source.id,
        action_payload_json=json.dumps({"title": source.title, "type": source.source_type})
    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(source)
    return source

@router.get("", response_model=List[SourceResponse])
async def list_sources(db: AsyncSession = Depends(get_db)):
    stmt = select(Source).order_by(Source.ingested_at.desc())
    res = await db.execute(stmt)
    sources = res.scalars().all()
    
    result = []
    for s in sources:
        # Count mentions
        m_stmt = select(func.count(EntityMention.id)).where(EntityMention.source_id == s.id)
        m_count = (await db.execute(m_stmt)).scalar() or 0
        s_dict = {
            "id": s.id,
            "title": s.title,
            "source_type": s.source_type,
            "source_uri": s.source_uri,
            "content_sha256": s.content_sha256,
            "original_language": s.original_language,
            "status": s.status,
            "ingested_at": s.ingested_at,
            "entity_count": m_count
        }
        result.append(s_dict)
    return result

@router.get("/{source_id}", response_model=SourceDetailResponse)
async def get_source(source_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Source).where(Source.id == source_id)
    res = await db.execute(stmt)
    source = res.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    chunk_stmt = select(SourceChunk).where(SourceChunk.source_id == source_id).order_by(SourceChunk.chunk_index)
    chunk_res = await db.execute(chunk_stmt)
    chunks = chunk_res.scalars().all()

    return {
        "id": source.id,
        "title": source.title,
        "source_type": source.source_type,
        "source_uri": source.source_uri,
        "content_sha256": source.content_sha256,
        "original_language": source.original_language,
        "status": source.status,
        "ingested_at": source.ingested_at,
        "entity_count": len(chunks),
        "chunks": [
            {
                "id": c.id,
                "chunk_index": c.chunk_index,
                "raw_text": c.raw_text,
                "translated_text": c.translated_text,
                "chunk_language": c.chunk_language,
                "char_offset_start": c.char_offset_start,
                "char_offset_end": c.char_offset_end
            }
            for c in chunks
        ]
    }
