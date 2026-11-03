"use client";

import React, { useEffect, useState } from "react";
import { api, VerificationQueue } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CheckSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Quote,
  Maximize2,
} from "lucide-react";

export const VerificationDockQueue: React.FC = () => {
  const { setTriageMode, refreshCounter, triggerRefresh, selectEdge, activeCase } = useWorkspaceStore();

  const [queue, setQueue] = useState<VerificationQueue>({
    pending_relationships: [],
    pending_entities: [],
    total_pending: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getVerificationQueue();
      setQueue(data);
    } catch (err) {
      console.error("Failed to load queue in dock:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [refreshCounter]);

  const filteredRelationships = queue.pending_relationships.filter((rel) => {
    let keywords: string[] = [];
    if (activeCase.id === "case-shadow-01") {
      keywords = ["vessel", "ocean", "caspian", "star", "maritime", "fujairah", "oman", "bunker", "fuel", "tanker", "bluewave"];
    } else if (activeCase.id === "case-kutch-02") {
      keywords = ["kutch", "kandla", "customs", "port", "manifest", "mumbai", "india", "pioneer", "cargo"];
    } else if (activeCase.id === "case-banking-03") {
      return false;
    }

    const text = `${rel.source_entity} ${rel.target_entity} ${rel.relation_type} ${rel.quote || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });

  const handleQuickDecision = async (
    targetType: "RELATIONSHIP" | "ENTITY",
    id: string,
    decision: "APPROVED" | "REJECTED" | "DISPUTED"
  ) => {
    try {
      await api.submitReview({
        target_type: targetType,
        target_id: id,
        decision,
        analyst_rationale: `Quick determination: ${decision} from verification dock.`,
      });
      triggerRefresh();
      loadQueue();
    } catch (err) {
      console.error("Quick review failed:", err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-workbench-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-workbench-text tracking-tight font-mono uppercase">
              Pending Verification Queue ({filteredRelationships.length}) · {activeCase.title.split("&")[0].trim()}
            </h4>
            <p className="text-[10px] text-workbench-muted font-mono">
              Adjudicate knowledge relationships and entity aliases for {activeCase.title}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTriageMode(true)}
          className="px-3 py-1 rounded bg-workbench-accent text-slate-950 text-xs font-mono font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Fullscreen Triage Mode</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-lg" count={2} />
        </div>
      ) : filteredRelationships.length === 0 ? (
        <EmptyState
          icon="shield"
          title="Case Queue Clean"
          description={`All extracted relationships and entities for ${activeCase.title} have been reviewed and committed.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRelationships.map((rel) => (
            <div
              key={rel.id}
              className="p-3 rounded-lg bg-workbench-panel border border-workbench-border hover:border-workbench-accent/40 transition-all space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <Badge variant="pending">RELATIONSHIP</Badge>
                <span className="text-[10px] text-workbench-muted font-mono">
                  {(rel.confidence * 100).toFixed(0)}% Conf
                </span>
              </div>

              <h5 className="text-xs font-bold text-workbench-text">
                {rel.source_entity} → <span className="text-workbench-accent">{rel.relation_type}</span> → {rel.target_entity}
              </h5>

              {rel.quote && (
                <p className="text-[11px] text-workbench-muted font-serif italic line-clamp-1 border-l-2 border-workbench-border pl-2">
                  "{rel.quote}"
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-workbench-border/50">
                <button
                  type="button"
                  onClick={() => selectEdge(rel.id, rel)}
                  className="text-[10px] text-workbench-muted hover:text-workbench-text transition-colors"
                >
                  Inspect details
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDecision("RELATIONSHIP", rel.id, "REJECTED")}
                    className="p-1 rounded hover:bg-rose-500/20 text-rose-500 transition-colors"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDecision("RELATIONSHIP", rel.id, "DISPUTED")}
                    className="p-1 rounded hover:bg-amber-500/20 text-amber-500 transition-colors"
                    title="Dispute"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDecision("RELATIONSHIP", rel.id, "APPROVED")}
                    className="p-1 rounded hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                    title="Approve"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

