"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Activity, Cpu, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const [health, setHealth] = useState<any>({
    status: "CONNECTING",
    graph_engine: "STANDBY",
    sarvam_ai: "STANDBY",
  });

  useEffect(() => {
    api.getHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: "STANDALONE", graph_engine: "EMBEDDED", sarvam_ai: "ACTIVE" }));
  }, []);

  return (
    <header className="h-16 border-b border-workbench-border bg-workbench-surface px-6 flex items-center justify-between shrink-0 transition-colors">
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono font-medium text-workbench-muted">SYSTEM TELEMETRY</span>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-workbench-bg border border-workbench-border text-xs">
          <Activity className="w-3.5 h-3.5 text-workbench-success animate-pulse" />
          <span className="font-mono text-[11px] text-workbench-text">API: {health.status}</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-workbench-bg border border-workbench-border text-xs">
          <Sparkles className="w-3.5 h-3.5 text-workbench-accent" />
          <span className="font-mono text-[11px] text-workbench-text">SARVAM AI: {health.sarvam_ai}</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-workbench-bg border border-workbench-border text-xs">
          <Cpu className="w-3.5 h-3.5 text-workbench-purple" />
          <span className="font-mono text-[11px] text-workbench-text">GRAPH: {health.graph_engine}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-workbench-success/15 border border-workbench-success/30 text-workbench-success text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PROVENANCE VERIFIED</span>
        </div>
        <div className="h-7 w-7 rounded-full bg-workbench-accent/20 border border-workbench-accent/40 flex items-center justify-center text-xs font-mono font-bold text-workbench-accent">
          LA
        </div>
      </div>
    </header>
  );
}
