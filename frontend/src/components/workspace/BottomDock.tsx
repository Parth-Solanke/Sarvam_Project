"use client";

import React, { useEffect, useState } from "react";
import { useWorkspaceStore, BottomDockTab } from "@/store/workspaceStore";
import { api, SignalItem, VerificationQueue, AuditRecord } from "@/lib/api";
import {
  Radio,
  CheckSquare,
  History,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  GripHorizontal,
} from "lucide-react";

interface BottomDockProps {
  signalsSlot?: React.ReactNode;
  verificationSlot?: React.ReactNode;
  auditSlot?: React.ReactNode;
  reportsSlot?: React.ReactNode;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  signalsSlot,
  verificationSlot,
  auditSlot,
  reportsSlot,
}) => {
  const { bottomDockTab, setBottomDockTab, refreshCounter, setTriageMode, activeCase } = useWorkspaceStore();

  const [signalCount, setSignalCount] = useState(activeCase?.signalsCount || 0);
  const [pendingCount, setPendingCount] = useState(activeCase?.activeReviews || 0);
  const [height, setHeight] = useState(360);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (activeCase) {
      setSignalCount(activeCase.signalsCount);
      setPendingCount(activeCase.activeReviews);
    }
  }, [activeCase, refreshCounter]);

  // Handle Drag Resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setIsMaximized(false);

    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(
        Math.max(160, startHeight + delta),
        window.innerHeight * 0.82
      );
      setHeight(newHeight);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
    };

    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    const startHeight = height;
    setIsDragging(true);
    setIsMaximized(false);

    const onTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0];
      const delta = startY - currentTouch.clientY;
      const newHeight = Math.min(
        Math.max(160, startHeight + delta),
        window.innerHeight * 0.82
      );
      setHeight(newHeight);
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  };

  const tabs: Array<{
    id: BottomDockTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }> = [
    {
      id: "signals",
      label: "Weak-Signal Radar",
      icon: Radio,
      count: signalCount,
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    {
      id: "verification",
      label: "Verification Queue",
      icon: CheckSquare,
      count: pendingCount,
      badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    },
    {
      id: "audit",
      label: "Audit Timeline",
      icon: History,
    },
    {
      id: "reports",
      label: "Intelligence Briefing",
      icon: FileSpreadsheet,
    },
  ];

  const currentHeight = isMaximized ? "72vh" : `${height}px`;

  return (
    <div className="border-t border-workbench-border bg-workbench-surface flex flex-col shrink-0 select-none z-20 shadow-xl transition-all">
      {/* 1. Resize Drag Handle at top of Dock (visible when expanded) */}
      {bottomDockTab !== null && (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`h-2.5 w-full cursor-row-resize bg-workbench-panel hover:bg-workbench-accent/20 flex items-center justify-center transition-colors group z-30 border-b border-workbench-border/50 ${
            isDragging ? "bg-workbench-accent/30" : ""
          }`}
          title="Drag up or down to resize bottom dock"
        >
          <div className="w-12 h-1 rounded-full bg-workbench-muted/40 group-hover:bg-workbench-accent transition-colors" />
        </div>
      )}

      {/* 2. Dock Header & Tabs Bar */}
      <div className="h-10 px-3 bg-workbench-panel flex items-center justify-between border-b border-workbench-border/60">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = bottomDockTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBottomDockTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors ${
                  isActive
                    ? "bg-workbench-surface text-workbench-text border-t-2 border-workbench-accent font-bold"
                    : "text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-workbench-accent" : "text-workbench-muted"}`} />
                <span className="truncate">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold border ${tab.badgeColor}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Dock Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {bottomDockTab === "verification" && (
            <button
              type="button"
              onClick={() => setTriageMode(true)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-workbench-accent/15 border border-workbench-accent/30 text-[10px] font-mono font-bold text-workbench-accent hover:bg-workbench-accent/25 transition-colors mr-1"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Full Triage Mode</span>
            </button>
          )}

          {bottomDockTab !== null && (
            <>
              {/* Maximize / Restore Toggle */}
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Restore Height" : "Maximize Dock"}
                className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
              >
                {isMaximized ? (
                  <Minimize2 className="w-3.5 h-3.5 text-workbench-accent" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Collapse Dock */}
              <button
                type="button"
                onClick={() => setBottomDockTab(null)}
                title="Collapse Dock"
                className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          )}

          {bottomDockTab === null && (
            <button
              type="button"
              onClick={() => setBottomDockTab("reports")}
              title="Expand Dock"
              className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Dock Resizable Content Area */}
      {bottomDockTab !== null && (
        <div
          style={{ height: currentHeight }}
          className="overflow-y-auto p-4 bg-workbench-surface transition-[height] duration-75"
        >
          {bottomDockTab === "signals" && (signalsSlot || <div className="text-xs text-workbench-muted">Signals radar feed loaded</div>)}
          {bottomDockTab === "verification" && (verificationSlot || <div className="text-xs text-workbench-muted">Verification desk loaded</div>)}
          {bottomDockTab === "audit" && (auditSlot || <div className="text-xs text-workbench-muted">Audit log timeline loaded</div>)}
          {bottomDockTab === "reports" && (reportsSlot || <div className="text-xs text-workbench-muted">Intelligence reports loaded</div>)}
        </div>
      )}
    </div>
  );
};
