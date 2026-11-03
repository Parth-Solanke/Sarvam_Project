"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore, CASES } from "@/store/workspaceStore";
import { api } from "@/lib/api";
import {
  Command,
  Search,
  UploadCloud,
  FileText,
  Network,
  Radio,
  CheckSquare,
  FileSpreadsheet,
  Sun,
  Moon,
  FolderOpen,
  ArrowRight,
  Sparkles,
  LayoutGrid,
} from "lucide-react";

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setIngestDrawerOpen,
    setTriageMode,
    setBottomDockTab,
    toggleTheme,
    setActiveCase,
    selectNode,
  } = useWorkspaceStore();

  const [query, setQuery] = useState("");
  const [entities, setEntities] = useState<any[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      api.getEntities()
        .then((res) => setEntities(res.slice(0, 8)))
        .catch(() => {});
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    {
      label: "Go to Main Investigation Workspace",
      icon: Network,
      category: "Navigation",
      run: () => {
        setCommandPaletteOpen(false);
        router.push("/workspace");
      },
    },
    {
      label: "Go to Operations Dashboard",
      icon: LayoutGrid,
      category: "Navigation",
      run: () => {
        setCommandPaletteOpen(false);
        router.push("/");
      },
    },
    {
      label: "Ingest New Document (Multilingual)",
      icon: UploadCloud,
      category: "Actions",
      run: () => {
        setCommandPaletteOpen(false);
        setIngestDrawerOpen(true);
      },
    },
    {
      label: "Launch Fullscreen Triage Mode",
      icon: Sparkles,
      category: "Actions",
      run: () => {
        setCommandPaletteOpen(false);
        setTriageMode(true);
      },
    },
    {
      label: "Open Weak-Signal Radar",
      icon: Radio,
      category: "Modules",
      run: () => {
        setCommandPaletteOpen(false);
        setBottomDockTab("signals");
        router.push("/workspace");
      },
    },
    {
      label: "Open Verification Queue",
      icon: CheckSquare,
      category: "Modules",
      run: () => {
        setCommandPaletteOpen(false);
        setBottomDockTab("verification");
        router.push("/workspace");
      },
    },
    {
      label: "Open Audit Timeline Ledger",
      icon: FileText,
      category: "Modules",
      run: () => {
        setCommandPaletteOpen(false);
        setBottomDockTab("audit");
        router.push("/workspace");
      },
    },
    {
      label: "Generate Intelligence Briefing",
      icon: FileSpreadsheet,
      category: "Modules",
      run: () => {
        setCommandPaletteOpen(false);
        setBottomDockTab("reports");
        router.push("/workspace");
      },
    },
    {
      label: "Toggle Ops Light / Dark Mode",
      icon: Sun,
      category: "Preferences",
      run: () => {
        setCommandPaletteOpen(false);
        toggleTheme();
      },
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEntities = entities.filter((e) =>
    e.canonical_name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-xl rounded-xl bg-workbench-surface border border-workbench-border shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-workbench-border flex items-center gap-2.5 bg-workbench-panel">
          <Search className="w-4 h-4 text-workbench-muted shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to an entity..."
            className="w-full bg-transparent text-xs text-workbench-text placeholder:text-workbench-muted focus:outline-none font-mono"
          />
          <kbd className="px-1.5 py-0.5 rounded border border-workbench-border bg-workbench-surface text-[10px] font-mono text-workbench-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Actions */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-workbench-muted px-2 block">
              Commands
            </span>
            {filteredActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={action.run}
                  className="w-full px-2.5 py-2 rounded-lg text-xs font-mono text-workbench-text hover:bg-workbench-hover flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-workbench-accent shrink-0" />
                    <span>{action.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-workbench-muted group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>

          {/* Quick Entities */}
          {filteredEntities.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-workbench-border/60">
              <span className="text-[10px] font-mono uppercase font-bold text-workbench-muted px-2 block">
                Entities in Active Graph
              </span>
              {filteredEntities.map((ent) => (
                <button
                  key={ent.id}
                  type="button"
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    selectNode(ent.id, ent);
                    router.push("/workspace");
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono text-workbench-text hover:bg-workbench-hover flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold truncate">{ent.canonical_name}</span>
                  <span className="text-[10px] text-workbench-muted uppercase">({ent.entity_type})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-workbench-border bg-workbench-panel flex items-center justify-between text-[10px] font-mono text-workbench-muted">
          <span>Tip: Press Cmd+K anywhere to activate palette</span>
          <span>SarvOSINT Core</span>
        </div>
      </div>
    </div>
  );
};

