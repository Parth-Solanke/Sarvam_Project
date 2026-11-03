"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme, setTheme } = useWorkspaceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync initial theme
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, [setTheme]);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-md bg-workbench-panel border border-workbench-border animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Ops Dark Mode"}
      aria-label="Toggle visual theme"
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-md border border-workbench-border bg-workbench-panel text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors shadow-sm ${className || ""}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-workbench-accent transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};

