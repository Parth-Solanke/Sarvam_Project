import { create } from "zustand";

export type SelectionType = "node" | "edge" | "source" | "signal";

export interface SelectedItem {
  type: SelectionType;
  id: string;
  data: any;
}

export type VerificationFilter = "ALL" | "APPROVED" | "PENDING" | "DISPUTED" | "REJECTED";
export type BottomDockTab = "signals" | "verification" | "audit" | "reports" | null;

export interface CaseItem {
  id: string;
  title: string;
  classification: string;
  description: string;
  activeReviews: number;
  signalsCount: number;
  updatedAt: string;
}

export const CASES: CaseItem[] = [
  {
    id: "case-maritime-01",
    title: "Maritime Shadow Fleet & STS Fuel Transfers",
    classification: "OPEN SOURCE // ANALYST WORKBENCH",
    description: "Multilingual tracking of flag-hopping tankers and STS bunker transfers across Gulf of Oman, Mumbai Port, and Singapore.",
    activeReviews: 3,
    signalsCount: 13,
    updatedAt: "2026-11-03",
  },
  {
    id: "case-kutch-02",
    title: "Gulf of Kutch Transshipment & Customs Manifest Discrepancies",
    classification: "RESTRICTED // LAW ENFORCEMENT",
    description: "Cross-referencing Hindi port manifests with AIS spoofing data off Kandla Port.",
    activeReviews: 1,
    signalsCount: 4,
    updatedAt: "2026-10-28",
  },
  {
    id: "case-banking-03",
    title: "Apex Commercial Intermediaries Network",
    classification: "CONFIDENTIAL // FINANCIAL INTEL",
    description: "Beneficial ownership tracing of shell entities routed via Singapore and Dubai.",
    activeReviews: 0,
    signalsCount: 6,
    updatedAt: "2026-10-15",
  },
];

interface WorkspaceState {
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;

  // Case & View
  homeViewOpen: boolean;
  setHomeViewOpen: (open: boolean) => void;
  activeCase: CaseItem;
  setActiveCase: (c: CaseItem) => void;

  // Panels & Drawers
  leftRailOpen: boolean;
  setLeftRailOpen: (open: boolean) => void;
  toggleLeftRail: () => void;

  rightInspectorOpen: boolean;
  setRightInspectorOpen: (open: boolean) => void;
  toggleRightInspector: () => void;

  bottomDockTab: BottomDockTab;
  setBottomDockTab: (tab: BottomDockTab) => void;

  ingestDrawerOpen: boolean;
  setIngestDrawerOpen: (open: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  triageMode: boolean;
  setTriageMode: (open: boolean) => void;

  // Traceable Selection (Shared across Graph, Inspector, and Evidence)
  selectedItem: SelectedItem | null;
  selectNode: (nodeId: string, nodeData?: any) => void;
  selectEdge: (edgeId: string, edgeData?: any) => void;
  selectSource: (sourceId: string, sourceData?: any) => void;
  selectSignal: (signalId: string, signalData?: any) => void;
  clearSelection: () => void;

  focusedNodeId: string | null;
  setFocusedNodeId: (id: string | null) => void;

  highlightedSpan: { start: number; end: number; text?: string; quote?: string } | null;
  setHighlightedSpan: (span: { start: number; end: number; text?: string; quote?: string } | null) => void;

  // Graph Filters & Overlays
  verificationFilter: VerificationFilter;
  setVerificationFilter: (filter: VerificationFilter) => void;

  signalOverlayEnabled: boolean;
  setSignalOverlayEnabled: (enabled: boolean) => void;
  toggleSignalOverlay: () => void;

  timeScrubberDate: string | null;
  setTimeScrubberDate: (date: string | null) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Refresh Trigger
  refreshCounter: number;
  triggerRefresh: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  theme: "dark",
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return { theme: nextTheme };
    }),
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    set({ theme });
  },

  homeViewOpen: false,
  setHomeViewOpen: (open) => set({ homeViewOpen: open }),
  activeCase: CASES[0],
  setActiveCase: (c) => set({ activeCase: c, homeViewOpen: false }),

  leftRailOpen: true,
  setLeftRailOpen: (open) => set({ leftRailOpen: open }),
  toggleLeftRail: () => set((state) => ({ leftRailOpen: !state.leftRailOpen })),

  rightInspectorOpen: true,
  setRightInspectorOpen: (open) => set({ rightInspectorOpen: open }),
  toggleRightInspector: () => set((state) => ({ rightInspectorOpen: !state.rightInspectorOpen })),

  bottomDockTab: null,
  setBottomDockTab: (tab) =>
    set((state) => ({
      bottomDockTab: state.bottomDockTab === tab ? null : tab,
    })),

  ingestDrawerOpen: false,
  setIngestDrawerOpen: (open) => set({ ingestDrawerOpen: open }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  triageMode: false,
  setTriageMode: (open) => set({ triageMode: open }),

  selectedItem: null,
  selectNode: (nodeId, nodeData) =>
    set({
      selectedItem: { type: "node", id: nodeId, data: nodeData || {} },
      focusedNodeId: nodeId,
      rightInspectorOpen: true,
    }),
  selectEdge: (edgeId, edgeData) =>
    set({
      selectedItem: { type: "edge", id: edgeId, data: edgeData || {} },
      rightInspectorOpen: true,
    }),
  selectSource: (sourceId, sourceData) =>
    set({
      selectedItem: { type: "source", id: sourceId, data: sourceData || {} },
      rightInspectorOpen: true,
    }),
  selectSignal: (signalId, signalData) =>
    set({
      selectedItem: { type: "signal", id: signalId, data: signalData || {} },
      rightInspectorOpen: true,
    }),
  clearSelection: () =>
    set({
      selectedItem: null,
      highlightedSpan: null,
    }),

  focusedNodeId: null,
  setFocusedNodeId: (id) => set({ focusedNodeId: id }),

  highlightedSpan: null,
  setHighlightedSpan: (span) => set({ highlightedSpan: span }),

  verificationFilter: "ALL",
  setVerificationFilter: (filter) => set({ verificationFilter: filter }),

  signalOverlayEnabled: false,
  setSignalOverlayEnabled: (enabled) => set({ signalOverlayEnabled: enabled }),
  toggleSignalOverlay: () => set((state) => ({ signalOverlayEnabled: !state.signalOverlayEnabled })),

  timeScrubberDate: null,
  setTimeScrubberDate: (date) => set({ timeScrubberDate: date }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  refreshCounter: 0,
  triggerRefresh: () => set((state) => ({ refreshCounter: state.refreshCounter + 1 })),
}));

