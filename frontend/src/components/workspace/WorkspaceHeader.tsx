"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Command,
  ChevronDown,
  Layers,
  Sparkles,
  Cpu,
  Activity,
  Maximize2,
  FolderOpen,
  LayoutGrid,
} from "lucide-react";
import { useWorkspaceStore, CASES, CaseItem } from "@/store/workspaceStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface WorkspaceHeaderProps {
  telemetry?: {
    apiStatus: string;
    graphEngine: string;
    sarvamAi: string;
  };
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ telemetry }) => {
  const {
    activeCase,
    setActiveCase,
    setCommandPaletteOpen,
    searchQuery,
    setSearchQuery,
    homeViewOpen,
    setHomeViewOpen,
    setTriageMode,
  } = useWorkspaceStore();

  const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);

  return (
    <header className="h-14 border-b border-workbench-border bg-workbench-surface px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Brand, Classification & Case Switcher */}
      <div className="flex items-center gap-3">
        {/* Brand Logo */}
        <Link
          href="/"
          title="SarvOSINT Operations Platform"
          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-workbench-hover transition-colors"
        >
          <div className="w-7 h-7 rounded bg-workbench-accent/15 border border-workbench-accent/40 flex items-center justify-center text-workbench-accent font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs tracking-wider text-workbench-text uppercase font-mono hidden sm:inline">
            SarvOSINT
          </span>
        </Link>

        <span className="h-4 w-px bg-workbench-border hidden sm:block" />

        {/* Classification & Case Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCaseDropdownOpen(!caseDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded border border-workbench-border bg-workbench-panel hover:bg-workbench-hover text-xs transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-workbench-accent animate-pulse" />
            <span className="font-mono text-[10px] text-workbench-muted tracking-tight font-bold uppercase hidden md:inline">
              CASE:
            </span>
            <span className="font-semibold text-workbench-text text-xs max-w-[200px] truncate">
              {activeCase.title}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {activeCase.activeReviews} PENDING
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-workbench-muted" />
          </button>

          {/* Case Dropdown */}
          {caseDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-80 rounded-lg bg-workbench-surface border border-workbench-border shadow-2xl p-2 z-50 animate-fade-in">
              <div className="px-2 py-1 text-[10px] font-mono uppercase font-bold text-workbench-muted">
                Active Investigations
              </div>
              <div className="space-y-1 mt-1">
                {CASES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCase(c);
                      setCaseDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded text-xs transition-colors flex flex-col gap-0.5 ${
                      c.id === activeCase.id
                        ? "bg-workbench-accent/15 border border-workbench-accent/30 text-workbench-text"
                        : "hover:bg-workbench-hover text-workbench-muted hover:text-workbench-text"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="truncate">{c.title}</span>
                      <span className="text-[10px] font-mono text-workbench-accent shrink-0">
                        {c.activeReviews} reviews
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-workbench-muted truncate">
                      {c.classification}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search & Cmd+K */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-workbench-muted absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities, IMO vessels, quotes, or SHA hashes..."
            className="w-full h-8 pl-8 pr-16 rounded-md bg-workbench-panel border border-workbench-border text-xs text-workbench-text placeholder:text-workbench-muted focus:outline-none focus:border-workbench-accent font-mono transition-colors"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="absolute right-2 px-1.5 py-0.5 rounded border border-workbench-border bg-workbench-surface text-[10px] font-mono text-workbench-muted hover:text-workbench-text flex items-center gap-0.5 shadow-sm"
          >
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </button>
        </div>
      </div>

      {/* Right: Actions, Telemetry, Theme Toggle & Analyst Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Quick Triage Button */}
        <button
          type="button"
          onClick={() => setTriageMode(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-workbench-accent/15 border border-workbench-accent/40 text-workbench-accent hover:bg-workbench-accent/25 text-xs font-mono font-bold transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>Triage Desk</span>
        </button>

        {/* Telemetry Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2 py-1 rounded bg-workbench-panel border border-workbench-border text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SARVAM</span>
          </span>
          <span className="text-workbench-border">|</span>
          <span className="text-workbench-muted">GRAPH: HYBRID</span>
        </div>

        {/* Theme Toggle (Light/Dark) */}
        <ThemeToggle />

        {/* Analyst Avatar */}
        <div
          title="Lead Analyst (analyst@workbench.osint)"
          className="w-7 h-7 rounded-full bg-workbench-accent/20 border border-workbench-accent/40 flex items-center justify-center text-xs font-mono font-bold text-workbench-accent cursor-pointer shadow-sm"
        >
          LA
        </div>
      </div>
    </header>
  );
};

