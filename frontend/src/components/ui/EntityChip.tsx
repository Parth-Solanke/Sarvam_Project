import React from "react";
import clsx from "clsx";
import {
  Building2,
  User,
  MapPin,
  Anchor,
  Calendar,
  Cpu,
  Layers,
} from "lucide-react";

export type EntityType = "ORGANIZATION" | "PERSON" | "LOCATION" | "VESSEL" | "EVENT" | "INFRASTRUCTURE" | string;

interface EntityChipProps {
  type: EntityType;
  name?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function getEntityConfig(type: string) {
  const norm = (type || "").toUpperCase();
  switch (norm) {
    case "ORGANIZATION":
      return {
        icon: Building2,
        color: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        border: "#0891b2",
        bg: "rgba(8, 145, 178, 0.15)",
      };
    case "PERSON":
      return {
        icon: User,
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        border: "#059669",
        bg: "rgba(16, 185, 129, 0.15)",
      };
    case "LOCATION":
      return {
        icon: MapPin,
        color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
        border: "#d97706",
        bg: "rgba(245, 158, 11, 0.15)",
      };
    case "VESSEL":
      return {
        icon: Anchor,
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        border: "#4f46e5",
        bg: "rgba(99, 102, 241, 0.15)",
      };
    case "EVENT":
      return {
        icon: Calendar,
        color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
        border: "#e11d48",
        bg: "rgba(244, 63, 94, 0.15)",
      };
    case "INFRASTRUCTURE":
      return {
        icon: Cpu,
        color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30",
        border: "#9333ea",
        bg: "rgba(168, 85, 247, 0.15)",
      };
    default:
      return {
        icon: Layers,
        color: "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/30",
        border: "#64748b",
        bg: "rgba(100, 116, 139, 0.15)",
      };
  }
}

export const EntityChip: React.FC<EntityChipProps> = ({
  type,
  name,
  onClick,
  className,
  size = "sm",
}) => {
  const cfg = getEntityConfig(type);
  const Icon = cfg.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md border font-mono tracking-tight transition-all",
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        cfg.color,
        onClick && "cursor-pointer hover:opacity-90 active:scale-95",
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span className="font-semibold truncate max-w-[160px]">{name || type}</span>
      {name && (
        <span className="text-[9px] opacity-70 uppercase tracking-widest pl-1 border-l border-current/20">
          {type}
        </span>
      )}
    </button>
  );
};

