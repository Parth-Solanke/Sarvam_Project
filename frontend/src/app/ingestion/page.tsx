"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  UploadCloud,
  FileText,
  Globe,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function IngestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("MANUAL_REPORT");
  const [sourceUri, setSourceUri] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreset = (type: string) => {
    if (type === "indic") {
      setTitle("अरब सागर में संदिग्ध ईंधन स्थानांतरण (Suspicious Bunkering in Arabian Sea)");
      setSourceType("URL");
      setSourceUri("https://news.maritime-regional.org/dispatches/2026/03/bunkering-alert");
      setContent(
        "भारतीय तटरक्षक बल ने ओमान की खाड़ी के पास MT Caspian Star और एक अज्ञात तेल टैंकर के बीच " +
        "अनधिकृत ईंधन स्थानांतरण का पता लगाया है। यह जहाज BlueWave Maritime Ltd द्वारा संचालित है। " +
        "अधिकारियों ने तुरंत जांच शुरू कर दी है और पोत को मुंबई (Mumbai) बंदरगाह की ओर निर्देशित किया गया है।"
      );
    } else {
      setTitle("Port of Singapore Authority: Dual-Use Cargo Routing Investigation");
      setSourceType("PDF");
      setSourceUri("file:///data/intel/psa_investigation_brief_2026.pdf");
      setContent(
        "Singapore Maritime and Port Authority officials have detained container manifest entries linked to " +
        "Indian Ocean Logistics Group. Cargo manifests indicate transshipment through Colombo prior to " +
        "reaching Singapore. Financial backing was cleared via Apex Commercial Bank under a commercial line of credit."
      );
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.ingestSource({
        title,
        source_type: sourceType,
        source_uri: sourceUri || undefined,
        content,
      });
      setResult(res);
    } catch (err: any) {
      setError("Ingestion failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-workbench-text flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-workbench-accent" />
            <span>Intelligence Ingestion Hub</span>
          </h2>
          <p className="text-xs text-workbench-muted font-mono mt-0.5">
            Ingest lawful multimodal intelligence, news dispatches, documents, and multilingual feeds.
          </p>
        </div>

        {/* Quick Test Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-workbench-muted">Load Preset:</span>
          <button
            type="button"
            onClick={() => handlePreset("indic")}
            className="px-2.5 py-1 rounded bg-workbench-surface border border-workbench-purple/40 text-[11px] font-mono text-workbench-purple hover:bg-workbench-hover"
          >
            🇮🇳 Indic Multilingual
          </button>
          <button
            type="button"
            onClick={() => handlePreset("english")}
            className="px-2.5 py-1 rounded bg-workbench-surface border border-workbench-border text-[11px] font-mono text-workbench-text hover:bg-workbench-hover"
          >
            📄 Maritime Dispatch
          </button>
        </div>
      </div>

      {/* Main Ingestion Form */}
      <form onSubmit={handleIngest} className="p-6 rounded-lg bg-workbench-surface border border-workbench-border space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono font-medium text-workbench-muted">Source Title / Reference *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Maritime Alert: Vessel STS Activity Fujairah Anchorage"
              className="w-full bg-workbench-panel border border-workbench-border rounded px-3 py-2 text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-workbench-muted">Source Classification</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full bg-workbench-panel border border-workbench-border rounded px-3 py-2 text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono"
            >
              <option value="MANUAL_REPORT">Manual Report / Dispatch</option>
              <option value="URL">Web URL / Crawled News</option>
              <option value="PDF">PDF Intelligence Brief</option>
              <option value="DOCX">DOCX Document</option>
              <option value="AUDIO">Audio Transcription (STT)</option>
              <option value="CSV">CSV / Tabular Dataset</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono font-medium text-workbench-muted">Source URI / Provenance URL (Optional)</label>
          <input
            type="text"
            value={sourceUri}
            onChange={(e) => setSourceUri(e.target.value)}
            placeholder="https://... or file:///path/to/evidence.pdf"
            className="w-full bg-workbench-panel border border-workbench-border rounded px-3 py-2 text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-medium text-workbench-muted">Intelligence Content (Raw Text / Non-English)</label>
            <span className="text-[10px] font-mono text-workbench-accent flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Sarvam Indic AI Enabled</span>
            </span>
          </div>
          <textarea
            required
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste raw text, translated wire, or incident report..."
            className="w-full bg-workbench-panel border border-workbench-border rounded p-3 text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-3 rounded bg-workbench-danger/15 border border-workbench-danger/30 text-workbench-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-mono text-workbench-muted">
            Cryptographic SHA-256 provenance is calculated on submission.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded bg-workbench-accent text-white text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Extracting & Syncing Graph...</span>
            ) : (
              <>
                <span>Execute Ingestion & Extraction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Ingestion Result Preview */}
      {result && (
        <div className="p-5 rounded-lg bg-workbench-surface border border-workbench-success/40 space-y-3">
          <div className="flex items-center gap-2 text-workbench-success text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Source Ingested & Synchronized to Knowledge Graph Successfully</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-workbench-panel border border-workbench-border">
              <span className="text-workbench-muted block text-[10px]">SOURCE ID</span>
              <span className="text-workbench-text truncate block">{result.id}</span>
            </div>
            <div className="p-2.5 rounded bg-workbench-panel border border-workbench-border">
              <span className="text-workbench-muted block text-[10px]">DETECTED LANG</span>
              <span className="text-workbench-purple font-bold block">{result.original_language.toUpperCase()}</span>
            </div>
            <div className="p-2.5 rounded bg-workbench-panel border border-workbench-border">
              <span className="text-workbench-muted block text-[10px]">STATUS</span>
              <span className="text-workbench-success font-bold block">{result.status}</span>
            </div>
            <div className="p-2.5 rounded bg-workbench-panel border border-workbench-border">
              <span className="text-workbench-muted block text-[10px]">CONTENT SHA-256</span>
              <span className="text-workbench-text truncate block">{result.content_sha256.slice(0, 12)}...</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => router.push("/graph")}
              className="px-3.5 py-1.5 rounded bg-workbench-accent text-white text-xs font-semibold hover:bg-blue-600"
            >
              Inspect on Knowledge Graph →
            </button>
            <button
              onClick={() => router.push("/verification")}
              className="px-3.5 py-1.5 rounded bg-workbench-panel border border-workbench-border text-xs font-semibold text-workbench-text hover:bg-workbench-hover"
            >
              Review in Verification Desk →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
