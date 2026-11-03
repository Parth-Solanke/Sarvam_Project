"use client";

import React from "react";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { EvidenceRail } from "./EvidenceRail";
import { BottomDock } from "./BottomDock";
import { IngestDrawer } from "./IngestDrawer";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface WorkspaceShellProps {
  centerCanvas: React.ReactNode;
  rightInspector: React.ReactNode;
  signalsSlot?: React.ReactNode;
  verificationSlot?: React.ReactNode;
  auditSlot?: React.ReactNode;
  reportsSlot?: React.ReactNode;
  triageOverlay?: React.ReactNode;
  commandPalette?: React.ReactNode;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  centerCanvas,
  rightInspector,
  signalsSlot,
  verificationSlot,
  auditSlot,
  reportsSlot,
  triageOverlay,
  commandPalette,
}) => {
  const {
    triageMode,
    rightInspectorOpen,
    toggleRightInspector,
  } = useWorkspaceStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-workbench-bg text-workbench-text select-none">
      {/* 1. Top Bar */}
      <WorkspaceHeader />

      {/* Main Investigation Three-Pane Workspace */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Rail: Evidence Sources (~280px, collapsible) */}
          <EvidenceRail />

          {/* Center: Graph Canvas (Hero screen, ~60% width) */}
          <main className="flex-1 min-w-0 flex flex-col bg-workbench-bg relative overflow-hidden">
            {centerCanvas}
          </main>

          {/* Right: Context-Sensitive Inspector (~360px, collapsible) */}
          {rightInspector}
        </div>

        {/* Bottom Dock (Collapsible, Tabbed) */}
        <BottomDock
          signalsSlot={signalsSlot}
          verificationSlot={verificationSlot}
          auditSlot={auditSlot}
          reportsSlot={reportsSlot}
        />
      </div>

      {/* Global Ingestion Drawer */}
      <IngestDrawer />

      {/* Fullscreen Triage Mode Overlay */}
      {triageMode && triageOverlay}

      {/* Cmd+K Command Palette */}
      {commandPalette}
    </div>
  );
};

