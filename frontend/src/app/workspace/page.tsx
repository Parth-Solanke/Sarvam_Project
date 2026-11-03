"use client";

import React, { useState } from "react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { TimeScrubber } from "@/components/graph/TimeScrubber";
import { InspectorPanel } from "@/components/inspector/InspectorPanel";
import { SignalsDockFeed } from "@/components/signals/SignalsDockFeed";
import { VerificationDockQueue } from "@/components/verification/VerificationDockQueue";
import { AuditLogTimeline } from "@/components/verification/AuditLogTimeline";
import { ReportsDockView } from "@/components/reports/ReportsDockView";
import { TriageModal } from "@/components/verification/TriageModal";
import { CommandPalette } from "@/components/workspace/CommandPalette";
import { EvidenceModal } from "@/components/evidence/EvidenceModal";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Languages } from "lucide-react";

export default function WorkspacePage() {
  const { selectedItem } = useWorkspaceStore();
  const [evidenceViewerOpen, setEvidenceViewerOpen] = useState(false);

  // If a source is selected, analyst can open the full bilingual side-by-side modal
  const selectedSourceId =
    selectedItem?.type === "source"
      ? selectedItem.id
      : selectedItem?.data?.source_id || null;

  return (
    <>
      <WorkspaceShell
        centerCanvas={
          <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
            {/* Hero Cytoscape Canvas */}
            <div className="flex-1 relative min-h-0">
              <GraphCanvas />

              {/* Floating Bilingual Reader button if a source or entity with source is active */}
              {selectedSourceId && (
                <button
                  type="button"
                  onClick={() => setEvidenceViewerOpen(true)}
                  className="absolute top-12 right-4 z-20 px-3 py-1.5 rounded-lg bg-workbench-surface/90 hover:bg-workbench-hover border border-workbench-accent text-workbench-accent text-xs font-mono font-bold shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Open Bilingual Reader</span>
                </button>
              )}
            </div>

            {/* Time Scrubber Replay Under the Graph */}
            <TimeScrubber />
          </div>
        }
        rightInspector={<InspectorPanel />}
        signalsSlot={<SignalsDockFeed />}
        verificationSlot={<VerificationDockQueue />}
        auditSlot={<AuditLogTimeline />}
        reportsSlot={<ReportsDockView />}
        triageOverlay={<TriageModal />}
        commandPalette={<CommandPalette />}
      />

      {/* Bilingual Document Verification Modal */}
      <EvidenceModal
        isOpen={evidenceViewerOpen}
        onClose={() => setEvidenceViewerOpen(false)}
        sourceId={selectedSourceId}
      />
    </>
  );
}

