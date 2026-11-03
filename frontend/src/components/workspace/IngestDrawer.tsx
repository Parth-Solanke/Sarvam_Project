"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { UploadCloud, Link as LinkIcon, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// Fast client-side Indic script heuristic preview
function detectScriptPreview(text: string): { lang: string; name: string } {
  if (!text) return { lang: "EN", name: "English" };
  const counts: Record<string, number> = {
    hi: 0,
    bn: 0,
    pa: 0,
    gu: 0,
    ta: 0,
    te: 0,
    kn: 0,
    ml: 0,
  };
  for (const char of text) {
    const cp = char.charCodeAt(0);
    if (cp >= 0x0900 && cp <= 0x097f) counts.hi++;
    else if (cp >= 0x0980 && cp <= 0x09ff) counts.bn++;
    else if (cp >= 0x0a00 && cp <= 0x0a7f) counts.pa++;
    else if (cp >= 0x0a80 && cp <= 0x0aff) counts.gu++;
    else if (cp >= 0x0b80 && cp <= 0x0bff) counts.ta++;
    else if (cp >= 0x0c00 && cp <= 0x0c7f) counts.te++;
    else if (cp >= 0x0c80 && cp <= 0x0cff) counts.kn++;
    else if (cp >= 0x0d00 && cp <= 0x0d7f) counts.ml++;
  }
  const max = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a), ["en", 0]);
  if (max[1] > 3) {
    const names: Record<string, string> = {
      hi: "Hindi / Devanagari",
      bn: "Bengali",
      pa: "Punjabi",
      gu: "Gujarati",
      ta: "Tamil",
      te: "Telugu",
      kn: "Kannada",
      ml: "Malayalam",
    };
    return { lang: max[0].toUpperCase(), name: names[max[0]] || "Indic" };
  }
  return { lang: "EN", name: "English" };
}

export const IngestDrawer: React.FC = () => {
  const { ingestDrawerOpen, setIngestDrawerOpen, triggerRefresh } = useWorkspaceStore();

  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState<"RAW_TEXT" | "URL" | "MANUAL_REPORT">("RAW_TEXT");
  const [sourceUri, setSourceUri] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const scriptPreview = detectScriptPreview(content);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setSuccessId(null);
    try {
      const res = await api.ingestSource({
        title: title.trim(),
        source_type: sourceType,
        source_uri: sourceUri.trim() || undefined,
        content: content.trim(),
      });
      setSuccessId(res.id);
      triggerRefresh();
      setTimeout(() => {
        setIngestDrawerOpen(false);
        setTitle("");
        setSourceUri("");
        setContent("");
        setSuccessId(null);
      }, 1200);
    } catch (err) {
      console.error("Ingestion failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={ingestDrawerOpen}
      onClose={() => setIngestDrawerOpen(false)}
      title="Ingest Intelligence Document"
      subtitle="Multilingual processing via Sarvam AI with SHA-256 fingerprinting"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successId ? (
          <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Document Ingested & Analyzed
            </h4>
            <p className="text-xs font-mono text-workbench-muted">
              Source ID: <span className="text-workbench-text">{successId}</span>
            </p>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-workbench-muted">
                Document Title / Incident Header
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Red Sea Surveillance: Tanker STS Transfer Observed"
                className="w-full h-9 px-3 rounded-md bg-workbench-panel border border-workbench-border text-xs text-workbench-text placeholder:text-workbench-muted focus:outline-none focus:border-workbench-accent font-sans transition-colors"
              />
            </div>

            {/* Type & URI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-workbench-muted">Source Modality</label>
                <select
                  value={sourceType}
                  onChange={(e: any) => setSourceType(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-workbench-panel border border-workbench-border text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono transition-colors"
                >
                  <option value="RAW_TEXT">Raw Text / Intercept</option>
                  <option value="URL">Web URL / OSINT Report</option>
                  <option value="MANUAL_REPORT">Customs / Port Manifest</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-workbench-muted">Source URI / Reference</label>
                <input
                  type="text"
                  value={sourceUri}
                  onChange={(e) => setSourceUri(e.target.value)}
                  placeholder="https://... or file://..."
                  className="w-full h-9 px-3 rounded-md bg-workbench-panel border border-workbench-border text-xs text-workbench-text placeholder:text-workbench-muted focus:outline-none focus:border-workbench-accent font-mono transition-colors"
                />
              </div>
            </div>

            {/* Content & Language Detection Preview */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-workbench-muted">
                  Intelligence Body (Hindi, Indic, or English)
                </label>
                {content.length > 5 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-workbench-muted">
                    <Sparkles className="w-3 h-3 text-workbench-accent" />
                    <span>Script: </span>
                    <Badge variant="lang" size="xs">
                      {scriptPreview.lang} · {scriptPreview.name}
                    </Badge>
                  </div>
                )}
              </div>
              <textarea
                required
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste raw text, Hindi port inspection dispatches, or English maritime intercepts..."
                className="w-full p-3 rounded-md bg-workbench-panel border border-workbench-border text-xs text-workbench-text placeholder:text-workbench-muted focus:outline-none focus:border-workbench-accent font-sans leading-relaxed transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-workbench-border">
              <span className="text-[11px] font-mono text-workbench-muted">
                Offsets preserved for verifiable citations
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIngestDrawerOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-workbench-border text-xs text-workbench-muted hover:text-workbench-text font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title || !content}
                  className="px-4 py-1.5 rounded-md bg-workbench-accent text-slate-950 text-xs font-bold font-mono hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Processing..." : "Ingest & Extract"}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

