"use client";

import { useEffect, useState } from "react";
import { api, VerificationQueue, AuditRecord } from "@/lib/api";
import { CheckSquare, ShieldCheck, XCircle, CheckCircle, AlertCircle, History, MessageSquare } from "lucide-react";

export default function VerificationPage() {
  const [queue, setQueue] = useState<VerificationQueue>({
    pending_relationships: [],
    pending_entities: [],
    total_pending: 0,
  });
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "audit">("queue");
  const [rationale, setRationale] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [q, a] = await Promise.all([api.getVerificationQueue(), api.getAuditLog()]);
      setQueue(q);
      setAuditLogs(a);
    } catch (err) {
      console.error("Failed to load verification queue:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "DISPUTED") => {
    if (!selectedTarget) return;
    if (!rationale) {
      alert("Please provide an analyst rationale note for audit integrity.");
      return;
    }

    setSubmitting(true);
    try {
      await api.submitReview({
        target_type: selectedTarget.target_type,
        target_id: selectedTarget.id,
        decision,
        analyst_rationale: rationale,
      });
      setSelectedTarget(null);
      setRationale("");
      await loadData();
    } catch (err) {
      console.error("Decision recording failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-workbench-text flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-workbench-success" />
            <span>Human Analyst Verification Desk</span>
          </h2>
          <p className="text-xs text-workbench-muted font-mono mt-0.5">
            Human-in-the-loop review queue // Mandatory audit rationales // Immutable oversight
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded bg-workbench-surface border border-workbench-border text-xs font-mono">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "queue"
                ? "bg-workbench-accent text-white font-bold"
                : "text-workbench-muted hover:text-workbench-text"
            }`}
          >
            Review Queue ({queue.total_pending})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "audit"
                ? "bg-workbench-accent text-white font-bold"
                : "text-workbench-muted hover:text-workbench-text"
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeTab === "queue" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Items List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-workbench-muted tracking-wider">
              Pending Relationship Assertions
            </h3>

            {queue.pending_relationships.length === 0 ? (
              <div className="p-8 rounded-lg bg-workbench-surface border border-workbench-border text-center text-xs font-mono text-workbench-muted">
                <CheckCircle className="w-6 h-6 text-workbench-success mx-auto mb-2" />
                <span>All extracted relationship assertions have been reviewed and verified.</span>
              </div>
            ) : (
              queue.pending_relationships.map((item) => {
                const active = selectedTarget?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTarget(item)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 ${
                      active
                        ? "bg-workbench-accent/10 border-workbench-accent"
                        : "bg-workbench-surface border-workbench-border hover:border-workbench-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-workbench-text">
                        {item.source_entity} → <span className="text-workbench-accent">{item.relation_type}</span> → {item.target_entity}
                      </span>
                      <span className="text-workbench-muted font-semibold">
                        {(item.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>

                    <blockquote className="text-xs italic text-workbench-text/80 pl-2.5 border-l-2 border-workbench-border font-mono">
                      "{item.quote}"
                    </blockquote>
                  </div>
                );
              })
            )}
          </div>

          {/* Review Decision Workspace */}
          <div className="lg:col-span-1">
            {selectedTarget ? (
              <div className="p-5 rounded-lg bg-workbench-surface border border-workbench-border space-y-4 sticky top-6">
                <div className="flex items-center gap-2 pb-2 border-b border-workbench-border">
                  <ShieldCheck className="w-4 h-4 text-workbench-accent" />
                  <h4 className="text-xs font-mono font-bold uppercase text-workbench-text">
                    Analyst Determination
                  </h4>
                </div>

                <div className="text-xs font-mono space-y-1">
                  <span className="text-[10px] text-workbench-muted block">TARGET ASSERTION</span>
                  <p className="font-bold text-workbench-text">
                    {selectedTarget.source_entity} → {selectedTarget.relation_type} → {selectedTarget.target_entity}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-workbench-muted">
                    Mandatory Audit Rationale *
                  </label>
                  <textarea
                    rows={4}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Document factual corroboration, secondary intelligence, or basis for rejection..."
                    className="w-full bg-workbench-panel border border-workbench-border rounded p-2.5 text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleDecision("APPROVED")}
                    disabled={submitting}
                    className="w-full py-2 rounded bg-workbench-success text-white text-xs font-bold font-mono hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Verify Relationship</span>
                  </button>

                  <button
                    onClick={() => handleDecision("REJECTED")}
                    disabled={submitting}
                    className="w-full py-2 rounded bg-workbench-danger text-white text-xs font-bold font-mono hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Assertion</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center rounded-lg bg-workbench-surface border border-workbench-border text-center p-6 text-workbench-muted">
                <CheckSquare className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-mono">Select an assertion from the review queue to record an analyst determination.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Immutable Audit Log Table */
        <div className="rounded-lg bg-workbench-surface border border-workbench-border overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-workbench-panel border-b border-workbench-border text-[11px] text-workbench-muted uppercase">
              <tr>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Resource</th>
                <th className="p-3.5">Analyst / IP</th>
                <th className="p-3.5">Audit Payload & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-workbench-border/50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-workbench-hover/40 transition-colors">
                  <td className="p-3.5 text-workbench-muted whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-workbench-panel border border-workbench-border text-workbench-accent">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-workbench-text">{log.resource_type}</td>
                  <td className="p-3.5 text-workbench-muted">
                    {log.user_id.slice(0, 8)} // {log.ip_address}
                  </td>
                  <td className="p-3.5 text-workbench-text/90 max-w-md truncate">
                    {JSON.stringify(log.action_payload)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
