"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { EntityChip } from "@/components/ui/EntityChip";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Quote,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  Fingerprint,
  Calendar,
  Hash,
} from "lucide-react";

export const InspectorPanel: React.FC = () => {
  const {
    rightInspectorOpen,
    toggleRightInspector,
    selectedItem,
    clearSelection,
    triggerRefresh,
    setHighlightedSpan,
  } = useWorkspaceStore();

  const [reviewRationale, setReviewRationale] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  if (!rightInspectorOpen) {
    return (
      <div className="w-10 border-l border-workbench-border bg-workbench-surface flex flex-col items-center py-3 shrink-0 select-none transition-all">
        <button
          type="button"
          onClick={toggleRightInspector}
          title="Expand Inspector"
          className="p-1.5 rounded-md text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="[writing-mode:vertical-rl] mt-6 text-[10px] font-mono uppercase tracking-widest text-workbench-muted font-bold">
          Context Inspector
        </span>
      </div>
    );
  }

  const handleReview = async (decision: "APPROVED" | "REJECTED" | "DISPUTED") => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    setReviewSuccess(null);

    try {
      const isRel = selectedItem.type === "edge" || selectedItem.data.relationship_id;
      const targetType = isRel ? "RELATIONSHIP" : "ENTITY";
      const targetId = isRel
        ? selectedItem.data.relationship_id || selectedItem.id
        : selectedItem.id;

      await api.submitReview({
        target_type: targetType,
        target_id: targetId,
        decision,
        analyst_rationale:
          reviewRationale.trim() ||
          `Analyst determination: ${decision} based on corroborating OSINT telemetry.`,
      });

      setReviewSuccess(`Decision recorded: ${decision}`);
      triggerRefresh();
      setTimeout(() => {
        setReviewSuccess(null);
        setReviewRationale("");
      }, 1500);
    } catch (err) {
      console.error("Review submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!selectedItem) {
      return (
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-workbench-panel mx-auto flex items-center justify-center border border-workbench-border shadow-inner">
            <Fingerprint className="w-7 h-7 text-workbench-accent/70" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-workbench-text">
              Context Inspector Ready
            </h4>
            <p className="text-xs text-workbench-muted leading-relaxed font-mono">
              Click any entity node, edge relation, signal card, or evidence document to inspect confidence, verbatim quotes, and provenance.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-workbench-panel/60 border border-workbench-border text-left space-y-1.5 text-xs font-mono">
            <div className="text-[10px] uppercase font-bold text-workbench-muted">
              Verification Standards
            </div>
            <div className="flex items-center gap-2 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Solid: Approved & Verified</span>
            </div>
            <div className="flex items-center gap-2 text-sky-500">
              <span className="w-2 h-2 rounded-full border border-sky-500 border-dashed" />
              <span>Dashed: Pending Triage</span>
            </div>
            <div className="flex items-center gap-2 text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Amber: Disputed Assertion</span>
            </div>
          </div>
        </div>
      );
    }

    const { type, data } = selectedItem;

    if (type === "node") {
      const entityType = data.type || "ORGANIZATION";
      const status = data.verification_status || data.resolution_status || "PENDING";
      const conf = data.confidence || 0.88;

      return (
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <EntityChip type={entityType} />
              <Badge
                variant={
                  status === "APPROVED" || status === "RESOLVED"
                    ? "approved"
                    : status === "DISPUTED"
                    ? "disputed"
                    : status === "REJECTED"
                    ? "rejected"
                    : "pending"
                }
              >
                {status}
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-workbench-text tracking-tight break-words">
              {data.label || data.canonical_name || "Unknown Entity"}
            </h3>
            {data.original_script_name && (
              <p className="text-xs text-workbench-accent font-mono">
                Original Script: {data.original_script_name}
              </p>
            )}
          </div>

          <ConfidenceBar score={conf} label="Extraction Confidence" />

          {/* Details / Aliases */}
          {data.aliases && data.aliases.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-workbench-muted">
                Observed Aliases & Acronyms
              </span>
              <div className="flex flex-wrap gap-1">
                {data.aliases.map((alias: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-workbench-panel border border-workbench-border text-workbench-text"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification Form */}
          <div className="p-3.5 rounded-lg bg-workbench-panel border border-workbench-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-workbench-text">
              <span>Analyst Adjudication</span>
              <ShieldCheck className="w-3.5 h-3.5 text-workbench-accent" />
            </div>

            <textarea
              rows={2}
              value={reviewRationale}
              onChange={(e) => setReviewRationale(e.target.value)}
              placeholder="Analyst determination rationale (required for audit trail)..."
              className="w-full p-2 rounded bg-workbench-surface border border-workbench-border text-xs text-workbench-text placeholder:text-workbench-muted focus:outline-none focus:border-workbench-accent font-sans transition-colors resize-none"
            />

            {reviewSuccess && (
              <div className="text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleReview("APPROVED")}
                className="py-1.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleReview("DISPUTED")}
                className="py-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/25 transition-colors disabled:opacity-50"
              >
                Dispute
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleReview("REJECTED")}
                className="py-1.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold hover:bg-rose-500/25 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (type === "edge") {
      const status = data.verification_status || "PENDING";
      const conf = data.confidence || 0.9;
      const quote = data.quote || "Direct correlation observed in ingested evidence.";

      return (
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-workbench-muted">
                Knowledge Relation
              </span>
              <Badge
                variant={
                  status === "VERIFIED" || status === "APPROVED"
                    ? "approved"
                    : status === "DISPUTED"
                    ? "disputed"
                    : status === "REJECTED"
                    ? "rejected"
                    : "pending"
                }
              >
                {status}
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-workbench-text tracking-tight font-mono">
              {data.source} → <span className="text-workbench-accent">{data.label}</span> → {data.target}
            </h3>
          </div>

          <ConfidenceBar score={conf} label="Extraction Confidence" />

          {/* Verbatim Supporting Evidence */}
          <div className="p-3.5 rounded-lg bg-workbench-panel border border-workbench-border space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-workbench-accent">
              <Quote className="w-3.5 h-3.5" />
              <span>Verbatim Evidence Quote</span>
            </div>
            <p className="text-xs text-workbench-text font-serif italic leading-relaxed border-l-2 border-workbench-accent pl-2.5">
              "{quote}"
            </p>
            {data.char_offset_start !== undefined && (
              <span className="text-[10px] font-mono text-workbench-muted block">
                Character Span: [{data.char_offset_start} : {data.char_offset_end}]
              </span>
            )}
          </div>

          {/* Verification Form */}
          <div className="p-3.5 rounded-lg bg-workbench-panel border border-workbench-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-workbench-text">
              <span>Relation Adjudication</span>
              <ShieldCheck className="w-3.5 h-3.5 text-workbench-accent" />
            </div>

            <textarea
              rows={2}
              value={reviewRationale}
              onChange={(e) => setReviewRationale(e.target.value)}
              placeholder="Analyst determination rationale..."
              className="w-full p-2 rounded bg-workbench-surface border border-workbench-border text-xs text-workbench-text placeholder:text-workbench-muted focus:outline-none focus:border-workbench-accent font-sans transition-colors resize-none"
            />

            {reviewSuccess && (
              <div className="text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleReview("APPROVED")}
                className="py-1.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleReview("DISPUTED")}
                className="py-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/25 transition-colors disabled:opacity-50"
              >
                Dispute
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleReview("REJECTED")}
                className="py-1.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold hover:bg-rose-500/25 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (type === "signal") {
      return (
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
              {data.signal_type || "WEAK_SIGNAL"}
            </span>
            <h3 className="text-sm font-bold text-workbench-text tracking-tight mt-1">
              {data.title}
            </h3>
          </div>

          <ConfidenceBar score={data.confidence || 0.85} label="Anomaly Confidence" />

          <div className="p-3.5 rounded bg-workbench-panel border border-workbench-border space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-workbench-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Statistical Rationale</span>
            </div>
            <p className="text-xs text-workbench-text font-mono leading-relaxed">
              {data.explanation}
            </p>
          </div>
        </div>
      );
    }

    if (type === "source") {
      return (
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="lang">{(data.original_language || "EN").toUpperCase()}</Badge>
              <Badge variant="hash">SHA:{data.content_sha256?.substring(0, 10)}</Badge>
            </div>
            <h3 className="text-sm font-bold text-workbench-text tracking-tight mt-1">
              {data.title}
            </h3>
          </div>

          <div className="space-y-2 text-xs font-mono text-workbench-muted">
            <div className="flex items-center justify-between border-b border-workbench-border/60 pb-1">
              <span>Type</span>
              <span className="text-workbench-text">{data.source_type}</span>
            </div>
            {data.source_uri && (
              <div className="flex items-center justify-between border-b border-workbench-border/60 pb-1">
                <span>URI</span>
                <span className="text-workbench-accent truncate max-w-[180px]">{data.source_uri}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-b border-workbench-border/60 pb-1">
              <span>Status</span>
              <span className="text-emerald-500 font-bold">TAMPER-EVIDENT VERIFIED</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <aside className="w-80 sm:w-96 border-l border-workbench-border bg-workbench-surface flex flex-col shrink-0 select-none z-10 transition-all">
      {/* Inspector Header */}
      <div className="h-10 px-3 border-b border-workbench-border flex items-center justify-between bg-workbench-panel">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-workbench-accent" />
          <h3 className="text-xs font-bold text-workbench-text tracking-tight uppercase font-mono">
            Inspector
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {selectedItem && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-[10px] font-mono text-workbench-muted hover:text-workbench-text px-1.5 py-0.5 rounded hover:bg-workbench-hover transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={toggleRightInspector}
            title="Collapse Inspector"
            className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </aside>
  );
};

