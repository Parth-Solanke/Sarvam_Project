"use client";

import { useEffect, useState } from "react";
import { api, SignalItem } from "@/lib/api";
import { Radio, AlertTriangle, ShieldAlert, Sparkles, RefreshCw, CheckCircle, HelpCircle } from "lucide-react";

export default function SignalsPage() {
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchSignals = async () => {
    try {
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
  }, []);

  const handleScan = async () => {
    setScanning(true);
    await fetch("http://127.0.0.1:8000/api/v1/signals/scan", { method: "POST" });
    await fetchSignals();
    setScanning(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-workbench-text flex items-center gap-2">
            <Radio className="w-5 h-5 text-workbench-warning" />
            <span>Weak-Signal & Anomaly Radar</span>
          </h2>
          <p className="text-xs text-workbench-muted font-mono mt-0.5">
            Explainable statistical patterns, Pointwise Mutual Information (PMI), and Louvain community clusters.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-3.5 py-1.5 rounded bg-workbench-surface border border-workbench-warning/40 text-xs font-mono font-semibold text-workbench-warning hover:bg-workbench-hover flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
          <span>{scanning ? "Scanning Knowledge Graph..." : "Execute Statistical Scan"}</span>
        </button>
      </div>

      {/* Signal Cards */}
      <div className="space-y-4">
        {signals.map((sig) => (
          <div
            key={sig.id}
            className="p-5 rounded-lg bg-workbench-surface border border-workbench-border hover:border-workbench-warning/50 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-workbench-warning/15 text-workbench-warning border border-workbench-warning/30 uppercase">
                    {sig.signal_type}
                  </span>
                  <span className="text-xs font-mono text-workbench-muted">
                    Confidence: {(sig.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <h3 className="text-sm font-bold text-workbench-text">{sig.title}</h3>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-workbench-panel border border-workbench-border text-workbench-muted">
                {sig.verification_status}
              </span>
            </div>

            {/* Statistical Explanation */}
            <div className="p-3.5 rounded bg-workbench-panel border border-workbench-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-workbench-accent uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explainable Analytics (Why was this flagged?)</span>
              </div>
              <p className="text-xs text-workbench-text/90 leading-relaxed font-mono">
                {sig.explanation}
              </p>
            </div>

            {/* Alternative Hypotheses */}
            {sig.alternative_interpretations && (
              <div className="p-3 rounded bg-workbench-bg border border-workbench-border/60 text-xs font-mono space-y-1">
                <span className="text-[10px] uppercase font-bold text-workbench-muted flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-workbench-muted" />
                  <span>Alternative Interpretations & Non-Causal Hypotheses</span>
                </span>
                <p className="text-workbench-muted leading-relaxed">
                  {sig.alternative_interpretations}
                </p>
              </div>
            )}

            {/* Metrics Breakdown */}
            {sig.metrics && Object.keys(sig.metrics).length > 0 && (
              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-workbench-muted">
                <span className="font-bold text-workbench-text">Mathematical Metrics:</span>
                {Object.entries(sig.metrics).map(([k, v]: [string, any]) => (
                  <span key={k} className="px-2 py-0.5 rounded bg-workbench-panel border border-workbench-border">
                    {k}: <span className="text-workbench-accent">{typeof v === "object" ? JSON.stringify(v) : v}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

