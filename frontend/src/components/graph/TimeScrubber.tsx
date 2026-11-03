"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Calendar, FastForward } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";

const DATES = [
  "2026-02-14",
  "2026-02-18",
  "2026-02-22",
  "2026-02-28",
];

const DATE_LABELS: Record<string, string> = {
  "2026-02-14": "14 Feb: Gulf of Oman STS Rendezvous",
  "2026-02-18": "18 Feb: Mumbai Port Customs Inspection",
  "2026-02-22": "22 Feb: Red Sea Satellite Transponder Spoofing",
  "2026-02-28": "28 Feb: Gulf of Kutch Financial Clearing Alert",
};

export const TimeScrubber: React.FC = () => {
  const { timeScrubberDate, setTimeScrubberDate } = useWorkspaceStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [index, setIndex] = useState(DATES.length - 1);

  useEffect(() => {
    setTimeScrubberDate(DATES[index]);
  }, [index, setTimeScrubberDate]);

  // Replay network evolution
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setIndex((prev) => {
          if (prev >= DATES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setIndex(0);
  };

  return (
    <div className="h-10 px-4 border-t border-workbench-border bg-workbench-surface/90 backdrop-blur-md flex items-center justify-between gap-3 text-xs font-mono select-none z-10 shrink-0">
      {/* Play / Pause / Reset Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Pause Replay" : "Replay Network Timeline"}
          className="p-1 rounded bg-workbench-panel hover:bg-workbench-hover border border-workbench-border text-workbench-accent transition-colors flex items-center gap-1 px-2"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold">{isPlaying ? "PAUSE" : "PLAY TIMELINE"}</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          title="Reset to Genesis"
          className="p-1 rounded bg-workbench-panel hover:bg-workbench-hover border border-workbench-border text-workbench-muted transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Date Slider & Label */}
      <div className="flex-1 max-w-xl flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={DATES.length - 1}
          value={index}
          onChange={(e) => {
            setIsPlaying(false);
            setIndex(Number(e.target.value));
          }}
          className="w-full accent-workbench-accent cursor-pointer"
        />

        <span className="text-[11px] font-bold text-workbench-text shrink-0 truncate max-w-[280px]">
          {DATE_LABELS[DATES[index]] || DATES[index]}
        </span>
      </div>

      {/* Mode Badge */}
      <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-workbench-muted">
        <Calendar className="w-3 h-3 text-workbench-accent" />
        <span>Step {index + 1} of {DATES.length}</span>
      </div>
    </div>
  );
};

