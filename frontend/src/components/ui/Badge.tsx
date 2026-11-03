import React from "react";
import clsx from "clsx";
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

export type BadgeVariant = "approved" | "pending" | "disputed" | "rejected" | "lang" | "neutral" | "hash";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm";
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className,
  size = "xs",
  showIcon = true,
}) => {
  const sizeClasses = size === "xs" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  const getVariantStyles = () => {
    switch (variant) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
      case "pending":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 border-dashed";
      case "disputed":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40";
      case "rejected":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 line-through opacity-80";
      case "lang":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-mono uppercase font-bold";
      case "hash":
        return "bg-workbench-panel text-workbench-muted border border-workbench-border font-mono text-[10px]";
      default:
        return "bg-workbench-panel text-workbench-muted border border-workbench-border";
    }
  };

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (variant) {
      case "approved":
        return <CheckCircle2 className="w-3 h-3 mr-1 inline shrink-0" />;
      case "pending":
        return <Clock className="w-3 h-3 mr-1 inline shrink-0" />;
      case "disputed":
        return <AlertTriangle className="w-3 h-3 mr-1 inline shrink-0" />;
      case "rejected":
        return <XCircle className="w-3 h-3 mr-1 inline shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium tracking-tight",
        sizeClasses,
        getVariantStyles(),
        className
      )}
    >
      {renderIcon()}
      <span>{children}</span>
    </span>
  );
};

