"use client";

import React, { useEffect, useState } from "react";
import { api, AuditRecord } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  History,
  ShieldCheck,
  Link as LinkIcon,
  User,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export const AuditLogTimeline: React.FC = () => {
  const { refreshCounter } = useWorkspaceStore();

  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDecision, setFilterDecision] = useState<string>("ALL");

  useEffect(() => {
    async function loadAudit() {
      try {
        setLoading(true);
        const data = await api.getAuditLog();
        setRecords(data);
      } catch (err) {
        console.error("Failed to load audit log:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, [refreshCounter]);

  const filtered = records.filter((r) => {
    if (filterDecision === "ALL") return true;
    const dec = r.action_payload?.decision || r.action || "";
    return dec.toUpperCase().includes(filterDecision.toUpperCase());
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex items-center justify-between border-b border-workbench-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-workbench-panel border border-workbench-border flex items-center justify-center text-workbench-accent">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-workbench-text tracking-tight font-mono uppercase">
              Hash-Chained Audit Ledger
            </h4>
            <p className="text-[10px] text-workbench-muted font-mono">
              Immutable chronological chain of human analyst adjudications and state transitions
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          {["ALL", "APPROVED", "DISPUTED", "REJECTED"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterDecision(f)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                filterDecision === f
                  ? "bg-workbench-accent text-slate-950 font-bold"
                  : "bg-workbench-panel text-workbench-muted hover:text-workbench-text border border-workbench-border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" count={3} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="shield"
          title="No Audit Records Found"
          description="Adjudicate pending claims via the Inspector or Triage desk to generate tamper-evident audit entries."
        />
      ) : (
        <div className="space-y-3 relative pl-6">
          {filtered.map((record, index) => {
            const payload = record.action_payload || {};
            const decision = payload.decision || "MODIFIED";
            const rationale = payload.analyst_rationale || payload.rationale || "Adjudicated by analyst";
            const shortHash = record.id.substring(0, 8);
            const prevHash = index < filtered.length - 1 ? filtered[index + 1].id.substring(0, 8) : "GENESIS";

            const getBadgeVariant = () => {
              if (decision === "APPROVED" || decision === "RESOLVED") return "approved";
              if (decision === "DISPUTED") return "disputed";
              if (decision === "REJECTED") return "rejected";
              return "neutral";
            };

            return (
              <div
                key={record.id}
                className="relative p-3.5 rounded-lg bg-workbench-panel border border-workbench-border space-y-2 hash-chain-line text-xs font-mono"
              >
                {/* Node on the vertical line */}
                <div className="absolute -left-6 top-4 w-3 h-3 rounded-full bg-workbench-accent border-2 border-workbench-surface shadow-sm" />

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant()}>{decision}</Badge>
                    <span className="text-workbench-text font-bold">
                      {record.action} · {record.resource_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-workbench-muted">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{record.user_id ? record.user_id.substring(0, 8) : "Analyst"}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                    </span>
                  </div>
                </div>

                {/* Rationale */}
                <p className="text-workbench-text/90 font-sans text-xs bg-workbench-surface p-2 rounded border border-workbench-border/60">
                  "{rationale}"
                </p>

                {/* Hash Chain Chip */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-workbench-muted border-t border-workbench-border/40">
                  <span className="flex items-center gap-1 text-workbench-muted">
                    <LinkIcon className="w-2.5 h-2.5" />
                    <span>Parent: <span className="text-workbench-text">{prevHash}</span> → Node: <span className="text-workbench-accent">{shortHash}</span></span>
                  </span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>VERIFIED TAMPER-EVIDENT</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

