"use client";

import React from "react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { CaseLibraryHomeView } from "@/components/workspace/CaseLibraryHomeView";
import { IngestDrawer } from "@/components/workspace/IngestDrawer";
import { CommandPalette } from "@/components/workspace/CommandPalette";
import { TriageModal } from "@/components/verification/TriageModal";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function DashboardPage() {
  const { triageMode } = useWorkspaceStore();

  return (
    <div className="h-screen w-screen bg-workbench-bg text-workbench-text flex flex-col overflow-y-auto">
      {/* Top Header */}
      <WorkspaceHeader />

      {/* Main Dashboard Body - fully scrollable */}
      <main className="flex-1 w-full min-h-0">
        <CaseLibraryHomeView />
      </main>

      {/* Global Ingestion Drawer */}
      <IngestDrawer />

      {/* Fullscreen Triage Mode Overlay */}
      {triageMode && <TriageModal />}

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
