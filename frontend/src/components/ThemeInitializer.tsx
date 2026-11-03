"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function ThemeInitializer() {
  const { theme, setTheme } = useWorkspaceStore();

  useEffect(() => {
    // Check saved preference or default to dark ops room
    const saved = localStorage.getItem("sarvosint_theme") as "dark" | "light" | null;
    const initialTheme = saved || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [setTheme]);

  useEffect(() => {
    localStorage.setItem("sarvosint_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return null;
}

