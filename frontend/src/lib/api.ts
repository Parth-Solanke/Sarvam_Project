const BACKEND_URL = (
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "https://sarvam-project-mcwu.onrender.com"
).replace(/\/+$/, "");

export const API_BASE = `${BACKEND_URL}/api/v1`;

export interface SourceItem {
  id: string;
  title: string;
  source_type: string;
  source_uri?: string;
  content_sha256: string;
  original_language: string;
  status: string;
  ingested_at: string;
  entity_count?: number;
}

export interface EntityItem {
  id: string;
  canonical_name: string;
  entity_type: string;
  original_script_name?: string;
  aliases: string[];
  confidence_score: number;
  resolution_status: string;
  mention_count?: number;
}

export interface GraphData {
  nodes: Array<{
    data: {
      id: string;
      label: string;
      canonical_name?: string;
      type: string;
      confidence?: number;
      verification_status?: string;
      [key: string]: any;
    };
  }>;
  edges: Array<{
    data: {
      id: string;
      source: string;
      target: string;
      label: string;
      rel_type?: string;
      relationship_id?: string;
      quote?: string;
      confidence?: number;
      verification_status?: string;
      [key: string]: any;
    };
  }>;
}

export interface SignalItem {
  id: string;
  signal_type: string;
  title: string;
  explanation: string;
  alternative_interpretations?: string;
  supporting_evidence?: string;
  metrics?: Record<string, any>;
  verification_status: string;
  confidence: number;
}

export interface VerificationQueue {
  pending_relationships: Array<{
    id: string;
    target_type: string;
    source_entity: string;
    target_entity: string;
    relation_type: string;
    confidence: number;
    quote: string;
    created_at: string;
  }>;
  pending_entities: Array<{
    id: string;
    target_type: string;
    canonical_name: string;
    entity_type: string;
    confidence: number;
    aliases: string[];
    created_at: string;
  }>;
  total_pending: number;
}

export interface AuditRecord {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  action_payload: Record<string, any>;
  timestamp: string;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${BACKEND_URL}/health`);
    return res.json();
  },

  async getSources(): Promise<SourceItem[]> {
    const res = await fetch(`${API_BASE}/sources`);
    return res.json();
  },

  async getSourceDetail(id: string) {
    const res = await fetch(`${API_BASE}/sources/${id}`);
    return res.json();
  },

  async ingestSource(data: { title: string; source_type: string; source_uri?: string; content: string }) {
    const res = await fetch(`${API_BASE}/sources/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getEntities(): Promise<EntityItem[]> {
    const res = await fetch(`${API_BASE}/entities`);
    return res.json();
  },

  async getEntityProfile(id: string) {
    const res = await fetch(`${API_BASE}/entities/${id}`);
    return res.json();
  },

  async getGraph(): Promise<GraphData> {
    const res = await fetch(`${API_BASE}/graph/subgraph?limit=250`);
    return res.json();
  },

  async getEvidence(relationshipId: string) {
    const res = await fetch(`${API_BASE}/evidence/relationship/${relationshipId}`);
    return res.json();
  },

  async getSignals(): Promise<SignalItem[]> {
    const res = await fetch(`${API_BASE}/signals`);
    return res.json();
  },

  async scanSignals() {
    const res = await fetch(`${API_BASE}/signals/scan`, { method: "POST" });
    return res.json();
  },

  async getVerificationQueue(): Promise<VerificationQueue> {
    const res = await fetch(`${API_BASE}/verification/queue`);
    return res.json();
  },

  async submitReview(data: {
    target_type: string;
    target_id: string;
    decision: string;
    analyst_rationale: string;
  }) {
    const res = await fetch(`${API_BASE}/verification/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAuditLog(): Promise<AuditRecord[]> {
    const res = await fetch(`${API_BASE}/verification/audit-log`);
    return res.json();
  },

  async generateReport(data: { title: string }) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
