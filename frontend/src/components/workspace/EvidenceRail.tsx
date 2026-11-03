"use client";

import React, { useEffect, useState } from "react";
import { api, SourceItem } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FileText,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Filter,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

// Map of Case IDs to their target content SHA256 prefix for invariant cross-session matching
const CASE_PRIMARY_SHA: Record<string, string> = {
  "case-maritime-01": "6a398a71e9", // Maritime STS transfers in Gulf of Oman
  "case-shadow-01": "6a398a71e9",
  "case-kutch-02": "fc6c655ae6",   // Mumbai Port Customs Inspection
  "case-banking-03": "f1080e884c", // Corporate Network Analysis: Shadow Fleet
};

export const EvidenceRail: React.FC = () => {
  const {
    activeCase,
    leftRailOpen,
    toggleLeftRail,
    setIngestDrawerOpen,
    selectedItem,
    selectSource,
    refreshCounter,
  } = useWorkspaceStore();

  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadSources() {
      try {
        setLoading(true);
        const data = await api.getSources();
        setSources(data);
      } catch (err) {
        console.error("Failed to load sources in rail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSources();
  }, [refreshCounter]);

  const primaryTargetSha = CASE_PRIMARY_SHA[activeCase.id];

  // Helper to check if a source matches the active case's primary dossier
  const isCasePrimarySource = (s: SourceItem) => {
    if (!primaryTargetSha) return false;
    return s.content_sha256?.toLowerCase().startsWith(primaryTargetSha.toLowerCase());
  };

  // Filter and sort sources so all documents are always visible, with active case's dossier first
  const filteredSources = sources
    .filter((s) => {
      const matchesLang =
        filterLang === "ALL" || (s.original_language || "en").toLowerCase() === filterLang.toLowerCase();
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.content_sha256.toLowerCase().includes(query.toLowerCase());
      return matchesLang && matchesQuery;
    })
    .sort((a, b) => {
      if (isCasePrimarySource(a)) return -1;
      if (isCasePrimarySource(b)) return 1;
      return 0;
    });

  if (!leftRailOpen) {
    return (
      <div className="w-10 border-r border-workbench-border bg-workbench-surface flex flex-col items-center py-3 shrink-0 select-none transition-all">
        <button
          type="button"
          onClick={toggleLeftRail}
          title="Expand Evidence Rail"
          className="p-1.5 rounded-md text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="mt-8 [writing-mode:vertical-lr] text-[10px] font-mono tracking-widest uppercase text-workbench-muted">
          EVIDENCE · {sources.length}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 sm:w-80 border-r border-workbench-border bg-workbench-surface flex flex-col shrink-0 select-none z-10 transition-all">
      {/* Rail Header */}
      <div className="p-3 border-b border-workbench-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-workbench-panel flex items-center justify-center border border-workbench-border">
            <FileText className="w-3.5 h-3.5 text-workbench-accent" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-workbench-text tracking-tight uppercase font-mono">
              Evidence Sources
            </h3>
            <p className="text-[10px] text-workbench-muted font-mono">
              {sources.length} Documents · SHA-256 Hashed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIngestDrawerOpen(true)}
            className="px-2 py-1 rounded bg-workbench-accent text-slate-950 text-[10px] font-mono font-bold hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
          >
            <UploadCloud className="w-3 h-3" />
            <span>Ingest</span>
          </button>
          <button
            type="button"
            onClick={toggleLeftRail}
            title="Collapse Rail"
            className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Quick Search */}
      <div className="p-2.5 border-b border-workbench-border space-y-2 bg-workbench-bg/40">
        <div className="relative">
          <Search className="w-3 h-3 text-workbench-muted absolute left-2.5 top-2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter source title or SHA..."
            className="w-full h-7 pl-7 pr-2 rounded bg-workbench-panel border border-workbench-border text-[11px] text-workbench-text placeholder:text-workbench-muted focus:outline-none focus:border-workbench-accent font-mono transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {["ALL", "EN", "HI", "BN", "MR"].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setFilterLang(lang)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                filterLang === lang
                  ? "bg-workbench-accent text-slate-950"
                  : "bg-workbench-panel text-workbench-muted hover:text-workbench-text border border-workbench-border"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-workbench-border/50 text-[10px] font-mono">
          <span className="text-workbench-muted truncate">
            Active Dossier: <strong className="text-workbench-text">{activeCase.title.split("&")[0].trim()}</strong>
          </span>
          <span className="text-[10px] text-emerald-500 font-bold">
            {sources.length} Loaded
          </span>
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-16 w-full rounded-lg" count={3} />
          </div>
        ) : filteredSources.length === 0 ? (
          <EmptyState
            icon="folder"
            title="No Sources Found"
            description="No documents match the current filter. Ingest new raw text or URL."
            action={{
              label: "+ Ingest Document",
              onClick: () => setIngestDrawerOpen(true),
            }}
          />
        ) : (
          filteredSources.map((s) => {
            const isSelected = selectedItem?.type === "source" && selectedItem.id === s.id;
            const isPrimary = isCasePrimarySource(s);
            const lang = (s.original_language || "EN").toUpperCase();
            const shortSha = s.content_sha256 ? s.content_sha256.substring(0, 8) : "--------";

            return (
              <div
                key={s.id}
                onClick={() => selectSource(s.id, s)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-workbench-accent/10 border-workbench-accent shadow-sm"
                    : isPrimary
                    ? "bg-workbench-panel border-cyan-500/50 hover:border-cyan-400"
                    : "bg-workbench-panel/70 hover:bg-workbench-hover border-workbench-border"
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="lang" size="xs">
                      {lang}
                    </Badge>
                    <Badge variant="hash" size="xs" showIcon={false}>
                      SHA:{shortSha}
                    </Badge>
                    {isPrimary ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-500 border border-cyan-500/40">
                        CASE DOSSIER
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-workbench-muted border border-workbench-border">
                        CROSS-CASE
                      </span>
                    )}
                  </div>

                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" title="Extracted" />
                </div>

                <h4 className="text-xs font-bold text-workbench-text mt-1.5 line-clamp-2 leading-snug">
                  {s.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-workbench-muted font-mono mt-2 pt-1 border-t border-workbench-border/40">
                  <span className="truncate max-w-[140px]">
                    {s.source_type}
                  </span>
                  <span className="text-workbench-accent hover:underline flex items-center gap-0.5">
                    Inspect &gt;
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rail Bottom Status */}
      <div className="p-2 border-t border-workbench-border bg-workbench-panel/50 text-[10px] font-mono text-workbench-muted flex items-center justify-between">
        <span>Verified Cryptographic Ingest</span>
        <span className="text-emerald-500 font-bold">SHA-256</span>
      </div>
    </aside>
  );
};
