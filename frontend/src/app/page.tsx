"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, SourceItem, EntityItem, SignalItem, GraphData } from "@/lib/api";
import {
  FileText,
  Users,
  Network,
  Radio,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";

export default function OverviewPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [entities, setEntities] = useState<EntityItem[]>([]);
  const [graph, setGraph] = useState<GraphData>({ nodes: [], edges: [] });
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, e, g, sig] = await Promise.all([
          api.getSources(),
          api.getEntities(),
          api.getGraph(),
          api.getSignals(),
        ]);
        setSources(s);
        setEntities(e);
        setGraph(g);
        setSignals(sig);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-workbench-text">Intelligence Fusion Overview</h2>
          <p className="text-xs text-workbench-muted font-mono mt-0.5">
            Operational Situational Awareness // Indic Multilingual & Multi-Source Evidence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/ingestion"
            className="px-3.5 py-1.5 rounded bg-workbench-accent text-white text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>+ Ingest New Intelligence</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border">
          <div className="flex items-center justify-between text-workbench-muted mb-2">
            <span className="text-xs font-mono">SOURCES INGESTED</span>
            <FileText className="w-4 h-4 text-workbench-accent" />
          </div>
          <div className="text-2xl font-bold font-mono text-workbench-text">{sources.length}</div>
          <p className="text-[11px] text-workbench-muted mt-1">Multi-format & multilingual</p>
        </div>

        <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border">
          <div className="flex items-center justify-between text-workbench-muted mb-2">
            <span className="text-xs font-mono">EXTRACTED ENTITIES</span>
            <Users className="w-4 h-4 text-workbench-purple" />
          </div>
          <div className="text-2xl font-bold font-mono text-workbench-text">{entities.length}</div>
          <p className="text-[11px] text-workbench-muted mt-1">Persons, Orgs, Ports, Vessels</p>
        </div>

        <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border">
          <div className="flex items-center justify-between text-workbench-muted mb-2">
            <span className="text-xs font-mono">KNOWLEDGE GRAPH</span>
            <Network className="w-4 h-4 text-workbench-cyan" />
          </div>
          <div className="text-2xl font-bold font-mono text-workbench-text">{graph.edges.length}</div>
          <p className="text-[11px] text-workbench-muted mt-1">Evidence-backed relationships</p>
        </div>

        <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border">
          <div className="flex items-center justify-between text-workbench-muted mb-2">
            <span className="text-xs font-mono">WEAK-SIGNAL ALERTS</span>
            <Radio className="w-4 h-4 text-workbench-warning" />
          </div>
          <div className="text-2xl font-bold font-mono text-workbench-warning">{signals.length}</div>
          <p className="text-[11px] text-workbench-muted mt-1">Statistical anomalies detected</p>
        </div>
      </div>

      {/* Two-Column Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Intelligence Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border">
            <div className="flex items-center justify-between pb-3 border-b border-workbench-border mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-workbench-accent" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-workbench-text">
                  Ingested Intelligence Corpus
                </h3>
              </div>
              <Link href="/sources" className="text-xs text-workbench-accent hover:underline flex items-center gap-1 font-mono">
                <span>View All Sources</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded bg-workbench-panel border border-workbench-border hover:border-workbench-accent/50 transition-colors flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-workbench-accent/15 text-workbench-accent border border-workbench-accent/30 uppercase">
                        {s.source_type}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-workbench-purple/15 text-workbench-purple border border-workbench-purple/30 uppercase">
                        LANG: {s.original_language}
                      </span>
                      <span className="text-[11px] font-mono text-workbench-muted">
                        SHA-256: {s.content_sha256.slice(0, 10)}...
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-workbench-text">{s.title}</h4>
                    {s.source_uri && (
                      <p className="text-xs font-mono text-workbench-muted truncate max-w-lg mt-0.5">
                        {s.source_uri}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-workbench-success/15 text-workbench-success border border-workbench-success/30">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Signal Summary */}
          <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border">
            <div className="flex items-center justify-between pb-3 border-b border-workbench-border mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-workbench-warning" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-workbench-warning">
                  Active Weak-Signals & Co-occurrences
                </h3>
              </div>
              <Link href="/signals" className="text-xs text-workbench-accent hover:underline flex items-center gap-1 font-mono">
                <span>Investigate Signals</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {signals.map((sig) => (
                <div key={sig.id} className="p-3.5 rounded bg-workbench-panel border border-workbench-warning/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-workbench-warning/15 text-workbench-warning uppercase border border-workbench-warning/40">
                        {sig.signal_type}
                      </span>
                      <h4 className="text-xs font-semibold text-workbench-text">{sig.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-workbench-muted">
                      Confidence: {(sig.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-workbench-text/80 leading-relaxed">{sig.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Top Discovered Entities */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border">
            <div className="flex items-center justify-between pb-3 border-b border-workbench-border mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-workbench-purple" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-workbench-text">
                  Key Entities Extracted
                </h3>
              </div>
              <Link href="/entities" className="text-xs text-workbench-accent hover:underline flex items-center gap-1 font-mono">
                <span>Directory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {entities.slice(0, 8).map((ent) => (
                <div
                  key={ent.id}
                  className="p-2.5 rounded bg-workbench-panel border border-workbench-border flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-semibold text-workbench-text">{ent.canonical_name}</h5>
                    <span className="text-[10px] font-mono text-workbench-muted">{ent.entity_type}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-workbench-success/15 text-workbench-success">
                    {(ent.confidence_score * 100).toFixed(0)}% CONF
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-workbench-muted tracking-wider">Analyst Actions</h4>
            <div className="space-y-2">
              <Link
                href="/graph"
                className="w-full flex items-center justify-between p-2.5 rounded bg-workbench-panel border border-workbench-border hover:border-workbench-accent text-xs font-medium text-workbench-text"
              >
                <span>Launch Interactive Knowledge Graph</span>
                <Network className="w-4 h-4 text-workbench-accent" />
              </Link>
              <Link
                href="/verification"
                className="w-full flex items-center justify-between p-2.5 rounded bg-workbench-panel border border-workbench-border hover:border-workbench-success text-xs font-medium text-workbench-text"
              >
                <span>Open Verification Desk</span>
                <CheckCircle className="w-4 h-4 text-workbench-success" />
              </Link>
              <Link
                href="/reports"
                className="w-full flex items-center justify-between p-2.5 rounded bg-workbench-panel border border-workbench-border hover:border-workbench-purple text-xs font-medium text-workbench-text"
              >
                <span>Compile Intelligence Dossier</span>
                <Sparkles className="w-4 h-4 text-workbench-purple" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

