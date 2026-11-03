"use client";

import React, { useEffect, useState } from "react";
import { api, VerificationQueue } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Quote,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export const TriageModal: React.FC = () => {
  const { triageMode, setTriageMode, triggerRefresh } = useWorkspaceStore();

  const [queue, setQueue] = useState<VerificationQueue>({
    pending_relationships: [],
    pending_entities: [],
    total_pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rationale, setRationale] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<any | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getVerificationQueue();
      setQueue(data);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to load queue in triage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (triageMode) {
      fetchQueue();
    }
  }, [triageMode]);

  // Combine relationships and entities for triage
  const items: Array<{
    id: string;
    targetType: "RELATIONSHIP" | "ENTITY";
    title: string;
    assertion: string;
    quote?: string;
    confidence: number;
    created_at: string;
  }> = [
    ...queue.pending_relationships.map((r) => ({
      id: r.id,
      targetType: "RELATIONSHIP" as const,
      title: `${r.source_entity} → ${r.relation_type} → ${r.target_entity}`,
      assertion: `Relationship claim: ${r.source_entity} is linked to ${r.target_entity} via "${r.relation_type}"`,
      quote: r.quote,
      confidence: r.confidence || 0.88,
      created_at: r.created_at,
    })),
    ...queue.pending_entities.map((e) => ({
      id: e.id,
      targetType: "ENTITY" as const,
      title: `${e.canonical_name} (${e.entity_type})`,
      assertion: `Entity extraction: Identifies "${e.canonical_name}" as an active ${e.entity_type}`,
      quote: undefined,
      confidence: e.confidence || 0.85,
      created_at: e.created_at,
    })),
  ];

  const currentItem = items[currentIndex];

  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "DISPUTED") => {
    if (!currentItem) return;

    setIsSubmitting(true);
    try {
      await api.submitReview({
        target_type: currentItem.targetType,
        target_id: currentItem.id,
        decision,
        analyst_rationale:
          rationale.trim() ||
          `Triage determination: ${decision} verified by lead analyst via expedited workflow.`,
      });

      setLastAction({
        item: currentItem,
        decision,
      });

      setToastMessage(`Adjudicated: ${decision} · [${currentIndex + 1} of ${items.length}]`);

      setRationale("");
      triggerRefresh();

      if (currentIndex + 1 < items.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Refresh queue when done
        await fetchQueue();
      }

      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error("Adjudication failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard Shortcuts: A (Approve), R (Reject), D (Dispute), Escape (Exit)
  useEffect(() => {
    if (!triageMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in the rationale textarea
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
        if (e.key === "Escape") setTriageMode(false);
        return;
      }

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleDecision("APPROVED");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleDecision("REJECTED");
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleDecision("DISPUTED");
      } else if (e.key === "Escape") {
        setTriageMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triageMode, currentItem, rationale]);

  if (!triageMode) return null;

  const total = items.length;
  const progressPercent = total > 0 ? ((currentIndex) / total) * 100 : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl rounded-xl bg-workbench-surface border border-workbench-border shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-workbench-border bg-workbench-panel flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-workbench-accent/15 border border-workbench-accent/40 flex items-center justify-center text-workbench-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-workbench-text tracking-tight uppercase font-mono">
                  Rapid Intelligence Triage Mode
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-workbench-surface border border-workbench-border text-workbench-muted">
                  {total > 0 ? `${currentIndex + 1} / ${total}` : "0 / 0"}
                </span>
              </div>
              <p className="text-xs text-workbench-muted font-mono mt-0.5">
                Keyboard Shortcuts: <kbd className="px-1 py-0.2 bg-workbench-surface border rounded text-workbench-text font-bold">A</kbd> Approve · <kbd className="px-1 py-0.2 bg-workbench-surface border rounded text-workbench-text font-bold">R</kbd> Reject · <kbd className="px-1 py-0.2 bg-workbench-surface border rounded text-workbench-text font-bold">D</kbd> Dispute · <kbd className="px-1 py-0.2 bg-workbench-surface border rounded text-workbench-text font-bold">ESC</kbd> Exit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTriageMode(false)}
            className="p-1.5 rounded-md text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-workbench-border">
          <div
            className="h-full bg-workbench-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Triage Workspace */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !currentItem ? (
            <EmptyState
              icon="shield"
              title="All Assertions Adjudicated!"
              description="There are no pending entities or relationships remaining in the verification queue. High-confidence assertions have been committed to the knowledge graph."
              action={{
                label: "Return to Workspace",
                onClick: () => setTriageMode(false),
              }}
            />
          ) : (
            <>
              {/* Claim Card */}
              <div className="p-4 rounded-lg bg-workbench-panel border border-workbench-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="pending">PENDING ANALYST VERIFICATION</Badge>
                  <span className="text-[11px] font-mono text-workbench-muted">
                    Target: {currentItem.targetType}
                  </span>
                </div>
                <h4 className="text-base font-bold text-workbench-text leading-snug">
                  {currentItem.assertion}
                </h4>
                <ConfidenceBar score={currentItem.confidence} label="Extraction Confidence" />
              </div>

              {/* Verbatim Supporting Quote */}
              {currentItem.quote && (
                <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-workbench-accent">
                    <Quote className="w-4 h-4" />
                    <span>Verbatim Source Evidence</span>
                  </div>
                  <p className="text-xs text-workbench-text font-serif italic leading-relaxed border-l-2 border-workbench-accent pl-3">
                    "{currentItem.quote}"
                  </p>
                </div>
              )}

              {/* Analyst Rationale Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-workbench-muted flex items-center justify-between">
                  <span>Analyst Determination Rationale (Cryptographically Signed into Audit Log)</span>
                  <span className="text-[10px] text-workbench-muted">Optional</span>
                </label>
                <textarea
                  rows={2}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="e.g. Verified against independent satellite telemetry and port arrival logs..."
                  className="w-full p-3 rounded-md bg-workbench-panel border border-workbench-border text-xs text-workbench-text placeholder:text-workbench-muted focus:outline-none focus:border-workbench-accent font-sans transition-colors resize-none"
                />
              </div>

              {/* Toast */}
              {toastMessage && (
                <div className="p-2.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{toastMessage}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Triage Actions Footer */}
        {currentItem && (
          <div className="px-6 py-4 border-t border-workbench-border bg-workbench-panel flex items-center justify-between">
            <span className="text-xs font-mono text-workbench-muted hidden sm:inline">
              Press key or click button to advance
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision("REJECTED")}
                className="px-4 py-2 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold hover:bg-rose-500/25 transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject [R]</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision("DISPUTED")}
                className="px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/25 transition-all flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Dispute [D]</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision("APPROVED")}
                className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-mono font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve [A]</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

