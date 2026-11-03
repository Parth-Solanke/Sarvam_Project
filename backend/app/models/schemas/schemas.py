from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "ANALYST"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Source & Ingestion Schemas
class SourceIngestRequest(BaseModel):
    title: str
    source_type: str = "MANUAL_REPORT"  # URL, PDF, DOCX, OCR_IMAGE, AUDIO, CSV, MANUAL_REPORT
    source_uri: Optional[str] = None
    content: str
    original_language: Optional[str] = "en"
    publication_date: Optional[datetime] = None

class SourceResponse(BaseModel):
    id: str
    title: str
    source_type: str
    source_uri: Optional[str]
    content_sha256: str
    original_language: str
    status: str
    ingested_at: datetime
    entity_count: Optional[int] = 0

class ChunkResponse(BaseModel):
    id: str
    chunk_index: int
    raw_text: str
    translated_text: Optional[str]
    chunk_language: str
    char_offset_start: int
    char_offset_end: int

class SourceDetailResponse(SourceResponse):
    chunks: List[ChunkResponse] = []

# Entity Schemas
class EntityMentionResponse(BaseModel):
    id: str
    source_id: str
    source_title: str
    raw_mention: str
    char_start: int
    char_end: int
    confidence: float

class EntityResponse(BaseModel):
    id: str
    canonical_name: str
    entity_type: str
    original_script_name: Optional[str] = None
    aliases: List[str] = []
    confidence_score: float
    resolution_status: str
    mention_count: Optional[int] = 0

class EntityResolveRequest(BaseModel):
    source_entity_id: str
    target_canonical_id: str
    analyst_rationale: str

# Knowledge Graph Schemas
class CytoscapeNodeData(BaseModel):
    id: str
    label: str
    type: str
    confidence: Optional[float] = 1.0
    verification_status: Optional[str] = "VERIFIED"
    properties: Dict[str, Any] = {}

class CytoscapeNode(BaseModel):
    data: Dict[str, Any]

class CytoscapeEdge(BaseModel):
    data: Dict[str, Any]

class GraphResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class EvidenceResponse(BaseModel):
    relationship_id: str
    relation_type: str
    source_id: str
    source_title: str
    source_uri: Optional[str]
    quote_verbatim: str
    quote_offset_start: int
    quote_offset_end: int
    confidence: float
    verification_status: str

# Weak Signal & Anomaly Schemas
class SignalResponse(BaseModel):
    id: str
    signal_type: str
    title: str
    explanation: str
    metrics: Dict[str, Any] = {}
    verification_status: str
    created_at: datetime

# Verification & Audit Schemas
class VerificationDecisionRequest(BaseModel):
    target_type: str  # ENTITY | RELATIONSHIP | SIGNAL
    target_id: str
    decision: str     # APPROVED | REJECTED | MODIFIED | DISPUTED
    analyst_rationale: str
    modified_state: Optional[Dict[str, Any]] = None

class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    ip_address: str
    action_payload: Dict[str, Any] = {}
    timestamp: datetime

# Intelligence Report Schemas
class ReportGenerateRequest(BaseModel):
    title: str
    focus_entity_ids: List[str] = []
    include_timeline: bool = True
    include_geospatial: bool = True
    include_weak_signals: bool = True

class ReportResponse(BaseModel):
    report_id: str
    title: str
    generated_at: datetime
    markdown_content: str
    citations: List[Dict[str, Any]] = []
