import React from "react";
import clsx from "clsx";

interface ConfidenceBarProps {
  score: number; // 0.0 to 1.0 or 0 to 100
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  score,
  label = "Confidence",
  showValue = true,
  className,
}) => {
  const normalized = score > 1 ? Math.min(100, Math.max(0, score)) : Math.min(100, Math.max(0, score * 100));

  const getColor = () => {
    if (normalized >= 85) return "bg-emerald-500";
    if (normalized >= 65) return "bg-workbench-cyan";
    if (normalized >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className={clsx("space-y-1 text-xs", className)}>
      <div className="flex items-center justify-between text-[11px] text-workbench-muted font-mono">
        <span>{label}</span>
        {showValue && <span className="font-semibold text-workbench-text">{normalized.toFixed(0)}%</span>}
      </div>
      <div className="h-1.5 w-full rounded-full bg-workbench-panelAlt overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-300", getColor())}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};

