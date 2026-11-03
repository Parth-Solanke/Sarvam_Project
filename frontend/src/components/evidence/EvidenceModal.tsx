"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { BilingualEvidenceViewer } from "./BilingualEvidenceViewer";

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceId: string | null;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  sourceId,
}) => {
  if (!isOpen || !sourceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-5xl h-[85vh] rounded-xl bg-workbench-surface border border-workbench-border shadow-2xl overflow-hidden flex flex-col">
        <BilingualEvidenceViewer sourceId={sourceId} onClose={onClose} />
      </div>
    </div>
  );
};

