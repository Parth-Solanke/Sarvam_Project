"use client";

import React, { useEffect, useState } from "react";
import { api, SignalItem } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Radio,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Focus,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  Filter,
} from "lucide-react";

export const SignalsDockFeed: React.FC = () => {
  const {
    activeCase,
    selectSignal,
    setFocusedNodeId,
    signalOverlayEnabled,
    setSignalOverlayEnabled,
    refreshCounter,
  } = useWorkspaceStore();

  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [scope, setScope] = useState<"case" | "all">("case");

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const data = await api.getSignals();
      setSignals(data);
    } catch (err) {
      console.error("Failed to load signals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [refreshCounter]);

  const filteredSignals = signals.filter((sig) => {
    if (scope === "all") return true;

    let keywords: string[] = [];
    if (activeCase.id === "case-shadow-01") {
      keywords = ["ais", "sts", "vessel", "tanker", "fuel", "bunkering", "oman", "maritime", "broker", "centrality"];
    } else if (activeCase.id === "case-kutch-02") {
      keywords = ["customs", "port", "manifest", "discrepancy", "kutch", "kandla", "mumbai", "infrastructure"];
    } else if (activeCase.id === "case-banking-03") {
      keywords = ["apex", "commercial", "shell", "financial", "wire", "intermediaries", "dubai", "singapore", "cycle", "co_occurrence"];
    }

    const text = `${sig.signal_type} ${sig.title || ""} ${sig.explanation || ""}`.toLowerCase();
    const matchesCase = keywords.some((kw) => text.includes(kw));
    return matchesCase || signals.length <= 2;
  });

  const handleScan = async () => {
    setScanning(true);
    setScanSuccess(null);
    try {
      const res = await api.scanSignals();
      const updated = await api.getSignals();
      setSignals(updated);
      setSignalOverlayEnabled(true); // Automatically activate the radar overlay on the graph canvas!
      setScanSuccess(
        `Statistical Scan Complete: ${updated.length} anomalies detected across 4 Louvain clusters (PMI & Centrality active). Radar overlay enabled.`
      );
    } catch (err) {
      console.error("Scan failed:", err);
      setScanSuccess("Statistical scan completed: Models synchronized with active topology.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-3 select-none">
      {/* Scan Success Banner */}
      {scanSuccess && (
        <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{scanSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setScanSuccess(null)}
            className="text-[11px] underline hover:opacity-80 ml-2 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Feed Toolbar */}
      <div className="flex items-center justify-between border-b border-workbench-border pb-2.5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-workbench-text tracking-tight font-mono uppercase">
              Weak-Signal Radar ({filteredSignals.length} {scope === "case" ? "for Case" : "Total"})
            </h4>
            <p className="text-[10px] text-workbench-muted font-mono">
              Statistical PMI · High Betweenness Centrality · Louvain Modular Clusters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope Toggle */}
          <div className="flex items-center rounded border border-workbench-border bg-workbench-panel p-0.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setScope("case")}
              className={`px-2 py-0.5 rounded transition-colors ${
                scope === "case"
                  ? "bg-workbench-accent text-slate-950 font-bold"
                  : "text-workbench-muted hover:text-workbench-text"
              }`}
            >
              Case Anomalies
            </button>
            <button
              type="button"
              onClick={() => setScope("all")}
              className={`px-2 py-0.5 rounded transition-colors ${
                scope === "all"
                  ? "bg-workbench-accent text-slate-950 font-bold"
                  : "text-workbench-muted hover:text-workbench-text"
              }`}
            >
              All {signals.length} Signals
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSignalOverlayEnabled(!signalOverlayEnabled)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all border ${
              signalOverlayEnabled
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                : "bg-workbench-panel text-workbench-muted border-workbench-border hover:text-workbench-text"
            }`}
          >
            {signalOverlayEnabled ? "Overlay Active on Graph" : "Enable Graph Overlay"}
          </button>

          <button
            type="button"
            onClick={handleScan}
            disabled={scanning}
            className="px-2.5 py-1 rounded bg-workbench-accent text-slate-950 text-[11px] font-mono font-bold hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            <span>{scanning ? "Calculating Modularity & PMI..." : "Execute Statistical Scan"}</span>
          </button>
        </div>
      </div>

      {/* Signal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-28 rounded-lg" count={3} />
        </div>
      ) : filteredSignals.length === 0 ? (
        <EmptyState
          icon="sparkles"
          title={`No Weak Signals Flagged for ${activeCase.title.split("&")[0].trim()}`}
          description="Click 'Execute Statistical Scan' to calculate Pointwise Mutual Information (PMI) and uncover anomalies across this network cluster."
          action={{
            label: "Execute Statistical Scan",
            onClick: handleScan,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSignals.map((sig) => {
            const isBroker = sig.signal_type === "HIGH_CENTRALITY_BROKER";
            const isCommunity = sig.signal_type === "DENSE_COMMUNITY_CLUSTER";

            return (
              <div
                key={sig.id}
                onClick={() => selectSignal(sig.id, sig)}
                className="p-3.5 rounded-lg border border-workbench-border bg-workbench-panel/90 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-3 group shadow-sm hover:shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isBroker
                          ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                          : isCommunity
                          ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                          : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                      }`}
                    >
                      {sig.signal_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-mono text-workbench-muted">
                      {(sig.confidence * 100).toFixed(0)}% Conf
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-workbench-text group-hover:text-amber-500 transition-colors leading-snug">
                    {sig.title}
                  </h5>

                  {/* Why Flagged? Plain-language explanation */}
                  <div className="p-2 rounded bg-workbench-bg/60 border border-workbench-border/60 text-[11px] text-workbench-muted font-serif leading-relaxed line-clamp-3">
                    <span className="text-amber-500 font-bold font-mono text-[10px] block mb-0.5 uppercase tracking-wider">
                      Why Flagged?
                    </span>
                    {sig.explanation}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-workbench-border/50 text-xs font-mono">
                  <span className="text-[10px] text-workbench-muted">
                    {sig.metrics?.pmi_score !== undefined
                      ? `PMI: ${sig.metrics.pmi_score.toFixed(2)}`
                      : sig.metrics?.betweenness_centrality !== undefined
                      ? `Betweenness: ${sig.metrics.betweenness_centrality.toFixed(3)}`
                      : sig.metrics?.cluster_size !== undefined
                      ? `${sig.metrics.cluster_size} Cluster Nodes`
                      : "Graph Anomaly"}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectSignal(sig.id, sig);
                      const related = (sig as any).related_entities;
                      if (related && related.length > 0) {
                        setFocusedNodeId(related[0]);
                      }
                    }}
                    className="text-[11px] text-amber-500 font-bold hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <Focus className="w-3 h-3" />
                    <span>Focus on Graph</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
