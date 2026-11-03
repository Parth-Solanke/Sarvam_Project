"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore, CASES, CaseItem } from "@/store/workspaceStore";
import { api, SourceItem, SignalItem } from "@/lib/api";
import {
  ShieldAlert,
  ArrowRight,
  Radio,
  CheckSquare,
  Network,
  Clock,
  Sparkles,
  FolderOpen,
  UploadCloud,
  FileText,
  AlertTriangle,
  ChevronRight,
  Activity,
  ExternalLink,
} from "lucide-react";

export const CaseLibraryHomeView: React.FC = () => {
  const router = useRouter();
  const { setActiveCase, setIngestDrawerOpen, setTriageMode } = useWorkspaceStore();

  const [graphCount, setGraphCount] = useState({ nodes: 16, edges: 15 });
  const [signalsCount, setSignalsCount] = useState(13);
  const [reviewsCount, setReviewsCount] = useState(3);
  const [recentSources, setRecentSources] = useState<SourceItem[]>([]);
  const [recentSignals, setRecentSignals] = useState<SignalItem[]>([]);

  useEffect(() => {
    api.getGraph()
      .then((g) => setGraphCount({ nodes: g.nodes.length, edges: g.edges.length }))
      .catch(() => {});
    api.getSignals()
      .then((s) => {
        setSignalsCount(s.length);
        setRecentSignals(s.slice(0, 3));
      })
      .catch(() => {});
    api.getVerificationQueue()
      .then((q) => setReviewsCount(q.total_pending))
      .catch(() => {});
    api.getSources()
      .then((sources) => setRecentSources(sources.slice(0, 4)))
      .catch(() => {});
  }, []);

  const handleOpenCase = (c: CaseItem) => {
    setActiveCase(c);
    router.push("/workspace");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10 pb-24 space-y-10 select-none">
      {/* Title & Primary CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-workbench-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-workbench-accent/15 text-workbench-accent border border-workbench-accent/30 uppercase tracking-widest">
              Operations Center
            </span>
            <span className="text-xs text-workbench-muted font-mono">
              Sarvam Indic AI Fusion
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-workbench-text font-sans">
            Active Investigations Library
          </h1>
          <p className="text-xs sm:text-sm text-workbench-muted font-mono mt-1">
            Multilingual OSINT fusion · Entity extraction · Traceable knowledge graph
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIngestDrawerOpen(true)}
            className="px-3.5 py-2 rounded-lg border border-workbench-border bg-workbench-surface hover:bg-workbench-hover text-workbench-text text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-workbench-accent" />
            <span>Ingest Source</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/workspace")}
            className="px-4 py-2 rounded-lg bg-workbench-accent text-slate-950 text-xs font-mono font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg"
          >
            <span>Open Main Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Knowledge Graph Card */}
        <div
          onClick={() => router.push("/workspace")}
          className="p-5 rounded-xl bg-workbench-surface border border-workbench-border hover:border-workbench-accent/60 transition-all cursor-pointer space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-mono text-workbench-muted">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Knowledge Graph</span>
            <Network className="w-4 h-4 text-workbench-accent group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-workbench-text flex items-baseline gap-2">
            <span>{graphCount.nodes}</span>
            <span className="text-xs text-workbench-muted font-normal">nodes</span>
            <span className="text-workbench-border">·</span>
            <span>{graphCount.edges}</span>
            <span className="text-xs text-workbench-muted font-normal">edges</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-workbench-muted pt-1">
            <span>Hybrid Neo4j + NetworkX</span>
            <span className="text-workbench-accent flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span>View Canvas</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Weak-Signal Alerts Card */}
        <div
          onClick={() => router.push("/workspace")}
          className="p-5 rounded-xl bg-workbench-surface border border-workbench-border hover:border-amber-500/60 transition-all cursor-pointer space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-mono text-workbench-muted">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Weak-Signal Alerts</span>
            <Radio className="w-4 h-4 text-amber-500 animate-pulse group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-500 flex items-baseline gap-2">
            <span>{signalsCount}</span>
            <span className="text-xs text-workbench-muted font-normal">anomalies flagged</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-workbench-muted pt-1">
            <span>Statistical PMI & Betweenness</span>
            <span className="text-amber-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span>Radar Feed</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pending Reviews Card */}
        <div
          onClick={() => setTriageMode(true)}
          className="p-5 rounded-xl bg-workbench-surface border border-workbench-border hover:border-sky-500/60 transition-all cursor-pointer space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-mono text-workbench-muted">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Pending Reviews</span>
            <CheckSquare className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-500 flex items-baseline gap-2">
            <span>{reviewsCount}</span>
            <span className="text-xs text-workbench-muted font-normal">awaiting adjudication</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-workbench-muted pt-1">
            <span>Human-in-the-Loop</span>
            <span className="text-sky-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span>Launch Triage</span>
              <Sparkles className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Case Dossiers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-workbench-muted">
            Operational Case Workspaces
          </h3>
          <span className="text-[11px] font-mono text-workbench-muted">
            3 Active · Indic Language Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CASES.map((c) => (
            <div
              key={c.id}
              onClick={() => handleOpenCase(c)}
              className="p-5 rounded-xl bg-workbench-surface border border-workbench-border hover:border-workbench-accent transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-workbench-panel border border-workbench-border text-workbench-muted uppercase font-semibold">
                    {c.classification}
                  </span>
                  <span className="text-[11px] font-mono text-amber-500 font-bold">
                    {c.activeReviews} Pending
                  </span>
                </div>

                <h4 className="text-sm font-bold text-workbench-text group-hover:text-workbench-accent transition-colors leading-snug font-sans">
                  {c.title}
                </h4>

                <p className="text-xs text-workbench-muted font-serif leading-relaxed line-clamp-3">
                  {c.description}
                </p>
              </div>

              {/* Mini Graph Status Bar */}
              <div className="h-14 rounded-lg bg-workbench-panel border border-workbench-border/60 flex items-center justify-around px-3 text-workbench-muted">
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <Network className="w-3.5 h-3.5 text-workbench-accent" />
                  <span>Interactive Topology</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sarvam AI Active</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-workbench-border/50 text-xs font-mono">
                <span className="text-workbench-muted flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>Updated {c.updatedAt}</span>
                </span>
                <span className="text-workbench-accent font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Enter Workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Section: Recent Evidence Ingested & Live Weak Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ingested Evidence */}
        <div className="p-5 rounded-xl bg-workbench-surface border border-workbench-border space-y-4">
          <div className="flex items-center justify-between border-b border-workbench-border pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-workbench-accent" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-workbench-text">
                Recent Intelligence Sources
              </h4>
            </div>
            <button
              type="button"
              onClick={() => router.push("/workspace")}
              className="text-[11px] font-mono text-workbench-accent hover:underline flex items-center gap-1"
            >
              <span>View all in Rail</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentSources.map((src) => (
              <div
                key={src.id}
                onClick={() => router.push("/workspace")}
                className="p-2.5 rounded-lg bg-workbench-panel border border-workbench-border hover:border-workbench-accent/40 cursor-pointer transition-all flex items-center justify-between text-xs font-mono"
              >
                <div className="space-y-0.5 max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-500/15 text-sky-500 border border-sky-500/30 font-bold">
                      {src.original_language?.toUpperCase() || "EN"}
                    </span>
                    <span className="font-semibold text-workbench-text truncate">
                      {src.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-workbench-muted truncate">
                    SHA: {src.content_sha256 ? src.content_sha256.substring(0, 16) + "..." : "N/A"}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-workbench-muted">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                    {src.status}
                  </span>
                  <ExternalLink className="w-3 h-3 text-workbench-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Weak-Signal Anomalies */}
        <div className="p-5 rounded-xl bg-workbench-surface border border-workbench-border space-y-4">
          <div className="flex items-center justify-between border-b border-workbench-border pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-workbench-text">
                Flagged Weak-Signal Radar
              </h4>
            </div>
            <button
              type="button"
              onClick={() => router.push("/workspace")}
              className="text-[11px] font-mono text-amber-500 hover:underline flex items-center gap-1"
            >
              <span>View in Dock</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentSignals.map((sig) => (
              <div
                key={sig.id}
                onClick={() => router.push("/workspace")}
                className="p-2.5 rounded-lg bg-workbench-panel border border-workbench-border hover:border-amber-500/40 cursor-pointer transition-all space-y-1 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                    {sig.signal_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-workbench-muted">
                    Conf: {(sig.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[11px] text-workbench-text line-clamp-1 font-serif">
                  {sig.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
