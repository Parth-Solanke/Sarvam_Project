"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const SubpageHeader: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <header className="h-14 border-b border-workbench-border bg-workbench-surface px-6 flex items-center justify-between shrink-0 mb-6 select-none">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-workbench-panel border border-workbench-border hover:bg-workbench-hover text-xs font-mono font-semibold text-workbench-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </Link>
        <span className="h-4 w-px bg-workbench-border" />
        <div>
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-workbench-text">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] font-mono text-workbench-muted">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="w-7 h-7 rounded-full bg-workbench-accent/20 border border-workbench-accent/40 flex items-center justify-center text-xs font-mono font-bold text-workbench-accent">
          LA
        </div>
      </div>
    </header>
  );
};

