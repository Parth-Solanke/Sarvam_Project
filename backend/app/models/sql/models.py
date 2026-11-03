import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import declarative_base
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Index
)

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="ANALYST")  # ADMIN, SENIOR_ANALYST, ANALYST, AUDITOR
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Source(Base):
    __tablename__ = "sources"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(500), nullable=False)
    source_type = Column(String(50), nullable=False)  # URL, PDF, DOCX, OCR_IMAGE, AUDIO, CSV, MANUAL_REPORT
    source_uri = Column(Text, nullable=True)
    content_sha256 = Column(String(64), unique=True, index=True, nullable=False)
    original_language = Column(String(10), default="en")
    storage_path = Column(Text, nullable=True)
    metadata_json = Column(Text, default="{}")
    status = Column(String(50), default="PENDING")  # PENDING, PROCESSING, INDEXED, FAILED
    publication_date = Column(DateTime, nullable=True)
    ingested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SourceChunk(Base):
    __tablename__ = "source_chunks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_id = Column(String(36), ForeignKey("sources.id"), index=True, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    raw_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=True)
    chunk_language = Column(String(10), default="en")
    char_offset_start = Column(Integer, default=0)
    char_offset_end = Column(Integer, default=0)

class ExtractedEntity(Base):
    __tablename__ = "extracted_entities"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    canonical_name = Column(String(255), index=True, nullable=False)
    entity_type = Column(String(50), index=True, nullable=False)  # PERSON, ORGANIZATION, LOCATION, EVENT, INFRASTRUCTURE, DATE
    original_script_name = Column(String(255), nullable=True)
    aliases_json = Column(Text, default="[]")  # JSON list of aliases
    confidence_score = Column(Float, default=1.0)
    resolution_status = Column(String(50), default="RESOLVED")  # UNRESOLVED, RESOLVED, REJECTED
    resolved_canonical_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class EntityMention(Base):
    __tablename__ = "entity_mentions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_id = Column(String(36), ForeignKey("extracted_entities.id"), index=True, nullable=False)
    source_id = Column(String(36), ForeignKey("sources.id"), index=True, nullable=False)
    chunk_id = Column(String(36), ForeignKey("source_chunks.id"), index=True, nullable=False)
    raw_mention = Column(String(255), nullable=False)
    char_start = Column(Integer, nullable=False)
    char_end = Column(Integer, nullable=False)
    confidence = Column(Float, default=1.0)

class ExtractedRelationship(Base):
    __tablename__ = "extracted_relationships"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_entity_id = Column(String(36), ForeignKey("extracted_entities.id"), index=True, nullable=False)
    target_entity_id = Column(String(36), ForeignKey("extracted_entities.id"), index=True, nullable=False)
    relation_type = Column(String(100), index=True, nullable=False)
    confidence = Column(Float, default=1.0)
    extraction_method = Column(String(100), default="SARVAM_LLM_EXTRACT")
    verification_status = Column(String(50), default="UNVERIFIED")  # UNVERIFIED, VERIFIED, DISPUTED, REJECTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ExtractionEvidence(Base):
    __tablename__ = "extraction_evidence"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    relationship_id = Column(String(36), ForeignKey("extracted_relationships.id"), index=True, nullable=False)
    source_id = Column(String(36), ForeignKey("sources.id"), index=True, nullable=False)
    chunk_id = Column(String(36), ForeignKey("source_chunks.id"), nullable=True)
    quote_verbatim = Column(Text, nullable=False)
    quote_offset_start = Column(Integer, default=0)
    quote_offset_end = Column(Integer, default=0)
    extraction_confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AnalystReview(Base):
    __tablename__ = "analyst_reviews"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    analyst_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    target_type = Column(String(50), nullable=False)  # ENTITY, RELATIONSHIP, SOURCE, SIGNAL
    target_id = Column(String(36), index=True, nullable=False)
    decision = Column(String(50), nullable=False)  # APPROVED, REJECTED, MODIFIED, DISPUTED
    previous_state_json = Column(Text, default="{}")
    modified_state_json = Column(Text, default="{}")
    analyst_rationale = Column(Text, nullable=False)
    reviewed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False)
    action = Column(String(100), nullable=False)  # INGEST, RESOLVE, REVIEW, EXPORT, DELETE
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=False)
    ip_address = Column(String(45), default="127.0.0.1")
    action_payload_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SignalAnomaly(Base):
    __tablename__ = "signal_anomalies"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    signal_type = Column(String(100), nullable=False)  # TEMPORAL_BURST, GEO_CLUSTER, UNUSUAL_COOCCURRENCE, CONFLICTING_CLAIMS
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    metrics_json = Column(Text, default="{}")
    verification_status = Column(String(50), default="UNVERIFIED")  # UNVERIFIED, VERIFIED, DISPUTED, REJECTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

