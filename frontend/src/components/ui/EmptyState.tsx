import React from "react";
import { FolderSearch, Network, ShieldAlert, Sparkles, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: "folder" | "graph" | "shield" | "sparkles" | "inbox";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  title,
  description,
  action,
}) => {
  const renderIcon = () => {
    const cls = "w-10 h-10 text-workbench-muted stroke-[1.25]";
    switch (icon) {
      case "folder":
        return <FolderSearch className={cls} />;
      case "graph":
        return <Network className={cls} />;
      case "shield":
        return <ShieldAlert className={cls} />;
      case "sparkles":
        return <Sparkles className={cls} />;
      default:
        return <Inbox className={cls} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className="w-16 h-16 rounded-2xl bg-workbench-panel flex items-center justify-center border border-workbench-border shadow-inner">
        {renderIcon()}
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-workbench-text">{title}</h4>
        <p className="text-xs text-workbench-muted leading-relaxed font-mono">{description}</p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 px-3 py-1.5 rounded-md bg-workbench-accent text-slate-950 text-xs font-semibold hover:opacity-90 transition-all font-mono shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

