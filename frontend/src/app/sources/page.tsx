"use client";

import { useEffect, useState } from "react";
import { api, SourceItem } from "@/lib/api";
import { FileText, Shield, Globe, Clock, ChevronRight, Hash, ArrowLeft } from "lucide-react";
import { SubpageHeader } from "@/components/SubpageHeader";

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSources().then((data) => {
      setSources(data);
      setLoading(false);
    });
  }, []);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    const d = await api.getSourceDetail(id);
    setDetail(d);
  };

  return (
    <div className="min-h-screen bg-workbench-bg text-workbench-text overflow-y-auto">
      <SubpageHeader
        title="Source Document Explorer"
        subtitle="Immutable provenance corpus // Cryptographic SHA-256 hashes // Multilingual side-by-side inspection"
      />

      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Source List */}
          <div className="lg:col-span-1 space-y-2.5">
            {sources.map((s) => {
              const active = selectedId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    active
                      ? "bg-workbench-accent/10 border-workbench-accent shadow-sm"
                      : "bg-workbench-surface border-workbench-border hover:border-workbench-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-workbench-panel border border-workbench-border text-workbench-accent font-bold">
                      {s.source_type}
                    </span>
                    <span className="text-[10px] font-mono text-workbench-purple font-semibold">
                      {s.original_language.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-workbench-text line-clamp-2">{s.title}</h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-workbench-border/50 text-[10px] font-mono text-workbench-muted">
                    <span>SHA: {s.content_sha256.slice(0, 8)}...</span>
                    <span className="text-workbench-success">● {s.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Inspection Pane */}
          <div className="lg:col-span-2">
            {detail ? (
              <div className="p-6 rounded-lg bg-workbench-surface border border-workbench-border space-y-5">
                <div className="flex items-start justify-between pb-3 border-b border-workbench-border">
                  <div>
                    <h3 className="text-base font-bold text-workbench-text">{detail.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-workbench-muted">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-workbench-accent" />
                        <span>{detail.content_sha256}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-workbench-muted" />
                        <span>{new Date(detail.ingested_at).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chunks & Translation */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-workbench-muted">
                    Extracted Chunks & Side-by-Side Analysis
                  </h4>

                  {detail.chunks?.map((c: any) => (
                    <div key={c.id} className="p-4 rounded bg-workbench-panel border border-workbench-border space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-workbench-accent font-bold">Chunk #{c.chunk_index + 1}</span>
                        <span className="text-workbench-muted">
                          Offsets: [{c.char_offset_start} - {c.char_offset_end}]
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="p-3 rounded bg-workbench-bg border border-workbench-border/60 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-workbench-muted block">
                            Original Text ({c.chunk_language.toUpperCase()})
                          </span>
                          <p className="text-workbench-text leading-relaxed whitespace-pre-wrap">{c.raw_text}</p>
                        </div>

                        <div className="p-3 rounded bg-workbench-bg border border-workbench-border/60 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-workbench-accent block">
                            English Intelligence Normalization
                          </span>
                          <p className="text-workbench-text/90 leading-relaxed whitespace-pre-wrap">
                            {c.translated_text || c.raw_text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center rounded-lg bg-workbench-surface border border-workbench-border text-center p-6 text-workbench-muted">
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-mono">Select a source from the left panel to inspect provenance and text chunks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
