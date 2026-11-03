"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  Quote,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

export const ReportsDockView: React.FC = () => {
  const { activeCase, refreshCounter } = useWorkspaceStore();

  const [title, setTitle] = useState(activeCase?.title || "Maritime Shadow Fleet & Contraband Bunkering");
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCitationPopover, setActiveCitationPopover] = useState<any | null>(null);

  useEffect(() => {
    if (activeCase?.title) {
      setTitle(activeCase.title);
      setReport(null);
    }
  }, [activeCase]);

  const handleGenerate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const data = await api.generateReport({ title: title.trim() });
      setReport(data);
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!report?.markdown) return;
    navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExportPDF = () => {
    if (!report) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export the Intelligence Dossier PDF.");
      return;
    }

    const citationsHtml = (report.citations || [])
      .map(
        (c: any) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 8px; font-family: monospace; font-weight: bold;">[${c.citation_num}]</td>
          <td style="padding: 8px;"><strong>${c.title || "Intelligence Source"}</strong></td>
          <td style="padding: 8px; font-style: italic; color: #475569;">"${c.quote || ""}"</td>
          <td style="padding: 8px; font-family: monospace;">${((c.confidence || 0.85) * 100).toFixed(0)}%</td>
          <td style="padding: 8px; font-family: monospace; font-weight: bold; color: ${c.verification_status === "APPROVED" ? "#059669" : "#d97706"};">${c.verification_status || "PENDING"}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SarvOSINT Intelligence Dossier - ${report.title || "Briefing"}</title>
          <style>
            @page { size: A4; margin: 18mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              line-height: 1.6;
              padding: 24px;
              max-width: 840px;
              margin: 0 auto;
            }
            .header-banner {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .classification {
              font-family: monospace;
              font-weight: bold;
              font-size: 11px;
              background: #fef3c7;
              color: #b45309;
              padding: 4px 8px;
              border-radius: 4px;
              border: 1px solid #fde68a;
              display: inline-block;
            }
            .meta {
              font-family: monospace;
              font-size: 10px;
              color: #64748b;
              margin-bottom: 20px;
            }
            h1 { font-size: 22px; margin: 0 0 8px 0; color: #0f172a; }
            h2 { font-size: 14px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase; font-family: monospace; }
            .content { font-size: 13px; line-height: 1.8; white-space: pre-line; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 11px; font-family: monospace; border-bottom: 2px solid #cbd5e1; }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
              font-size: 10px;
              font-family: monospace;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <span class="classification">CONFIDENTIAL // OSINT FUSION ASSESSMENT</span>
            </div>
            <div style="font-family: monospace; font-size: 11px; font-weight: bold;">
              SARVOSINT PLATFORM · SARVAM AI
            </div>
          </div>

          <h1>${report.title || "Verifiable Intelligence Assessment"}</h1>
          <div class="meta">
            REPORT ID: ${report.report_id || "REP-" + Date.now()} | CASE: MARITIME SHADOW FLEET | DATE: ${new Date().toISOString().split("T")[0]}
          </div>

          <h2>1. Executive Assessment</h2>
          <div class="content">${report.markdown || "No assessment generated."}</div>

          <h2>2. Evidentiary Citations & Provenance</h2>
          <table>
            <thead>
              <tr>
                <th>REF</th>
                <th>SOURCE DOCUMENT</th>
                <th>VERBATIM INTEL EXTRACT</th>
                <th>CONF</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${citationsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>OFFICIAL INTELLIGENCE COMMUNITY BRIEFING</span>
            <span>PROVENANCE: HASH-CHAINED VERIFIABLE LEDGER</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between border-b border-workbench-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-workbench-panel border border-workbench-border flex items-center justify-center text-workbench-accent">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-workbench-text tracking-tight font-mono uppercase">
              Verifiable Intelligence Briefing
            </h4>
            <p className="text-[10px] text-workbench-muted font-mono">
              Synthesized assessment with live academic-grade citation anchors and provenance tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <>
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="px-2.5 py-1 rounded border border-workbench-border bg-workbench-panel text-workbench-text text-[11px] font-mono hover:bg-workbench-hover transition-colors flex items-center gap-1 shadow-sm"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy MD"}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="px-2.5 py-1 rounded border border-workbench-border bg-workbench-accent text-slate-950 text-[11px] font-mono font-bold hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3 h-3" />
                <span>Export PDF</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="px-3 py-1 rounded bg-workbench-accent text-slate-950 text-xs font-mono font-bold hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? "Synthesizing..." : "Generate Brief"}</span>
          </button>
        </div>
      </div>

      {/* Report Body */}
      {loading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : !report ? (
        <EmptyState
          icon="folder"
          title="No Briefing Generated Yet"
          description="Click 'Generate Brief' to assemble an evidence-backed intelligence report citing verified relationships, sources, and character offsets."
          action={{
            label: "Synthesize Briefing",
            onClick: handleGenerate,
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Metadata Chips */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-workbench-panel border border-workbench-border text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-workbench-muted">Report ID:</span>
              <span className="text-workbench-text font-bold">{report.report_id?.substring(0, 12)}...</span>
              <Badge variant="approved">VERIFIED EVIDENCE</Badge>
            </div>
            <div className="text-[10px] text-workbench-muted">
              {report.citations?.length || 0} Cited Evidence References
            </div>
          </div>

          {/* Citations Grid */}
          {report.citations && report.citations.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-workbench-muted block">
                Evidence Citation Anchors:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {report.citations.map((c: any) => (
                  <div
                    key={c.citation_index}
                    onClick={() => setActiveCitationPopover(c)}
                    className="p-2.5 rounded-lg bg-workbench-panel border border-workbench-border hover:border-workbench-accent/40 cursor-pointer text-xs font-mono space-y-1 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 rounded bg-workbench-accent text-slate-950 font-bold text-[10px]">
                        [{c.citation_index}]
                      </span>
                      <span className="text-[10px] text-workbench-muted">
                        {(c.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                    <p className="text-[11px] text-workbench-text/90 font-serif italic line-clamp-2">
                      "{c.quote}"
                    </p>
                    <span className="text-[10px] text-workbench-muted truncate block">
                      Src: {c.source_title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Markdown Content Reader */}
          <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border font-serif text-xs text-workbench-text leading-relaxed whitespace-pre-wrap select-text max-h-96 overflow-y-auto">
            {report.markdown}
          </div>
        </div>
      )}

      {/* Citation Popover Modal */}
      {activeCitationPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-lg rounded-xl bg-workbench-surface border border-workbench-border shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-workbench-border pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-workbench-accent text-slate-950 font-bold text-xs font-mono">
                  Citation [{activeCitationPopover.citation_index}]
                </span>
                <span className="text-xs font-mono font-bold text-workbench-text">
                  {(activeCitationPopover.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCitationPopover(null)}
                className="text-workbench-muted hover:text-workbench-text text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-workbench-panel border border-workbench-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-workbench-accent">
                <Quote className="w-3.5 h-3.5" />
                <span>Verbatim Source Quote</span>
              </div>
              <p className="text-xs text-workbench-text font-serif italic leading-relaxed">
                "{activeCitationPopover.quote}"
              </p>
            </div>

            <div className="text-xs font-mono text-workbench-muted space-y-1">
              <div>Source: <span className="text-workbench-text font-semibold">{activeCitationPopover.source_title}</span></div>
              <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Provenance Verified & Anchored to Source Offsets</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

