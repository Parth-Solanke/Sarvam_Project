"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  Network,
  Users,
  Radio,
  CheckSquare,
  FileSpreadsheet,
  ShieldAlert,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/ingestion", label: "Intelligence Ingest", icon: UploadCloud },
  { href: "/sources", label: "Source Explorer", icon: FileText },
  { href: "/graph", label: "Knowledge Graph", icon: Network },
  { href: "/entities", label: "Entities & Dossiers", icon: Users },
  { href: "/signals", label: "Weak-Signal Radar", icon: Radio },
  { href: "/verification", label: "Analyst Desk", icon: CheckSquare },
  { href: "/reports", label: "Intelligence Briefing", icon: FileSpreadsheet },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-workbench-border bg-workbench-surface flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-workbench-border px-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-workbench-accent/15 border border-workbench-accent/40 flex items-center justify-center text-workbench-accent">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wider text-workbench-text uppercase">OSINT Fusion</h1>
            <p className="text-[10px] text-workbench-muted font-mono tracking-tight">Workbench v1.0.0</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] uppercase font-mono font-bold text-workbench-muted tracking-wider">
            Operational Modules
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                  active
                    ? "bg-workbench-accent/15 text-workbench-accent border-l-2 border-workbench-accent font-semibold"
                    : "text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-workbench-accent" : "text-workbench-muted"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 border-t border-workbench-border bg-workbench-bg/50">
        <div className="text-[10px] font-mono text-workbench-muted leading-relaxed">
          <span className="text-workbench-warning font-semibold">LEGAL COMPLIANCE:</span> Ingest public data only. Correlation does not imply criminal intent.
        </div>
      </div>
    </aside>
  );
}
