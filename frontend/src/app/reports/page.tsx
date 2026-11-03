"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { FileSpreadsheet, Sparkles, Download, CheckCircle, FileText, ArrowRight } from "lucide-react";

export default function ReportsPage() {
  const [title, setTitle] = useState("Operational Intelligence Briefing: Maritime Bunkering & STS Networks");
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const data = await api.generateReport({ title });
      setReport(data);
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report.markdown_content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OSINT_REPORT_${report.report_id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-workbench-text flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-workbench-purple" />
            <span>Intelligence Briefing & Synthesis Studio</span>
          </h2>
          <p className="text-xs text-workbench-muted font-mono mt-0.5">
            Synthesize evidence-backed intelligence assessments with formal numbered citations and provenance trail.
          </p>
        </div>

        {report && (
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded bg-workbench-surface border border-workbench-border hover:border-workbench-accent text-xs font-mono font-semibold text-workbench-accent flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Markdown Briefing</span>
          </button>
        )}
      </div>

      {/* Generation Bar */}
      <form onSubmit={handleGenerate} className="p-4 rounded-lg bg-workbench-surface border border-workbench-border flex items-center gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Briefing Title..."
          className="flex-1 bg-workbench-panel border border-workbench-border rounded px-3 py-2 text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono"
        />
        <button
          type="submit"
          disabled={generating}
          className="px-4 py-2 rounded bg-workbench-accent text-white text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{generating ? "Synthesizing Evidence..." : "Compile Intelligence Report"}</span>
        </button>
      </form>

      {/* Rendered Intelligence Briefing */}
      {report ? (
        <div className="p-8 rounded-lg bg-workbench-surface border border-workbench-border space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-workbench-border text-xs font-mono text-workbench-muted">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-workbench-purple/15 text-workbench-purple border border-workbench-purple/30 font-bold uppercase">
                FORMAL ASSESSMENT
              </span>
              <span>REPORT ID: {report.report_id}</span>
            </div>
            <span>DATE: {new Date(report.generated_at).toUTCString()}</span>
          </div>

          <div className="prose prose-invert max-w-none font-mono text-xs text-workbench-text leading-relaxed whitespace-pre-wrap">
            {report.markdown_content}
          </div>

          {/* Citations List */}
          {report.citations && report.citations.length > 0 && (
            <div className="pt-6 border-t border-workbench-border space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-workbench-muted">
                Numbered Primary Evidence Citations
              </h4>
              <div className="space-y-2">
                {report.citations.map((c: any) => (
                  <div key={c.citation_index} className="p-3 rounded bg-workbench-panel border border-workbench-border text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-workbench-accent font-bold">
                      <span>[{c.citation_index}] Source: {c.source_title}</span>
                      <span className="text-workbench-success">{(c.confidence * 100).toFixed(0)}% Conf</span>
                    </div>
                    <p className="text-workbench-text/80 italic">"{c.quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center rounded-lg bg-workbench-surface border border-workbench-border text-center p-6 text-workbench-muted">
          <FileText className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-mono">Click "Compile Intelligence Report" to generate an assessment from verified knowledge graph evidence.</p>
        </div>
      )}
    </div>
  );
}
