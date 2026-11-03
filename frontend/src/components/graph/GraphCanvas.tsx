"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import cytoscape from "cytoscape";
// @ts-ignore
import coseBilkent from "cytoscape-cose-bilkent";
import { api, GraphData } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { getCytoscapeStylesheet } from "@/lib/graphStyles";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Radio,
  Filter,
  Layers,
  Sparkles,
  GitBranch,
  Network,
} from "lucide-react";

// Register layout extension if available
if (typeof cytoscape !== "undefined") {
  try {
    cytoscape.use(coseBilkent);
  } catch (e) {
    // Already registered or fallback
  }
}

// Mapping from Case IDs to their primary source document (supporting hash-based lookup)
const CASE_SOURCE_HASH_MAP: Record<string, string> = {
  "case-maritime-01": "6a398a71e9", // Maritime STS transfers in Gulf of Oman
  "case-shadow-01": "6a398a71e9",
  "case-kutch-02": "fc6c655ae6",   // Mumbai Port Customs Inspection (Hindi)
  "case-banking-03": "f1080e884c", // Corporate & banking network intermediaries
};

// Fallback direct source IDs
const CASE_SOURCE_MAP: Record<string, string> = {
  "case-maritime-01": "43e57962-3a76-411b-8d54-5bf735340625",
  "case-shadow-01": "43e57962-3a76-411b-8d54-5bf735340625",
  "case-kutch-02": "ed4f42fd-fd53-4821-8a97-27bd5f299f31",
  "case-banking-03": "95621ed9-95de-4a88-8caf-2b430938fc9b",
};

// Normalize backend statuses: RESOLVED/VERIFIED -> APPROVED, UNRESOLVED/UNVERIFIED -> PENDING
function normalizeStatus(rawStatus?: string): "APPROVED" | "PENDING" | "DISPUTED" | "REJECTED" {
  if (!rawStatus) return "PENDING";
  const s = rawStatus.toUpperCase();
  if (s === "APPROVED" || s === "VERIFIED" || s === "RESOLVED") return "APPROVED";
  if (s === "DISPUTED") return "DISPUTED";
  if (s === "REJECTED") return "REJECTED";
  return "PENDING";
}

export const GraphCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({});

  const {
    activeCase,
    theme,
    selectNode,
    selectEdge,
    focusedNodeId,
    verificationFilter,
    setVerificationFilter,
    signalOverlayEnabled,
    toggleSignalOverlay,
    refreshCounter,
    searchQuery,
    timeScrubberDate,
  } = useWorkspaceStore();

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [viewScope, setViewScope] = useState<"case" | "fusion">("case");

  // 1. Fetch graph dataset once or when refreshCounter changes
  useEffect(() => {
    let isMounted = true;
    async function fetchGraph() {
      try {
        setLoading(true);
        const data = await api.getGraph();
        if (isMounted) {
          setGraphData(data);
        }
      } catch (err) {
        console.error("Failed to load graph data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchGraph();
    return () => {
      isMounted = false;
    };
  }, [refreshCounter]);

  // Handle Refresh WITHOUT changing orientation
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await api.getGraph();
      setGraphData(data);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Run layout with force embedding
  const runLayout = useCallback((randomize: boolean = false) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    if (randomize) {
      positionsRef.current = {};
    }
    const layout = cy.layout({
      name: "cose-bilkent",
      // @ts-ignore
      animate: true,
      animationDuration: 500,
      randomize,
      fit: true,
      padding: 50,
      nodeDimensionsIncludeLabels: true,
      nodeRepulsion: 45000,
      idealEdgeLength: 175,
      edgeElasticity: 0.25,
      nestingFactor: 0.1,
      gravity: 0.2,
      numIter: 2500,
      tile: true,
      tilingPaddingVertical: 40,
      tilingPaddingHorizontal: 40,
    });
    layout.on("layoutstop", () => {
      cy.nodes().forEach((n) => {
        positionsRef.current[n.id()] = { ...n.position() };
      });
    });
    layout.run();
  }, []);

  // 2. Initialize Cytoscape Instance only when graphData changes
  useEffect(() => {
    if (!containerRef.current || graphData.nodes.length === 0) return;

    // Cache any existing positions before updating
    if (cyRef.current) {
      cyRef.current.nodes().forEach((n) => {
        positionsRef.current[n.id()] = { ...n.position() };
      });
    }

    const hasPositions = Object.keys(positionsRef.current).length > 0;

    // Build elements with normalized verification_status and preserved positions
    const elements: cytoscape.ElementDefinition[] = [
      ...graphData.nodes.map((n) => {
        const normStatus = normalizeStatus(n.data.verification_status || n.data.resolution_status);
        const pos = positionsRef.current[n.data.id];
        return {
          group: "nodes" as const,
          data: {
            ...n.data,
            normalized_status: normStatus,
            verification_status: normStatus,
          },
          position: pos ? { ...pos } : undefined,
        };
      }),
      ...graphData.edges.map((e) => {
        const normStatus = normalizeStatus(e.data.verification_status);
        return {
          group: "edges" as const,
          data: {
            ...e.data,
            normalized_status: normStatus,
            verification_status: normStatus,
          },
        };
      }),
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: getCytoscapeStylesheet(theme === "dark"),
      layout: hasPositions
        ? { name: "preset", fit: false }
        : {
            name: "cose-bilkent",
            // @ts-ignore
            animate: true,
            animationDuration: 600,
            randomize: true,
            fit: true,
            padding: 50,
            nodeDimensionsIncludeLabels: true,
            nodeRepulsion: 45000,
            idealEdgeLength: 175,
            edgeElasticity: 0.25,
            nestingFactor: 0.1,
            gravity: 0.2,
            numIter: 2500,
            tile: true,
            tilingPaddingVertical: 40,
            tilingPaddingHorizontal: 40,
          },
      minZoom: 0.2,
      maxZoom: 3.5,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    // Save computed positions whenever layout stops or a node is dragged
    cy.on("layoutstop", () => {
      cy.nodes().forEach((n) => {
        positionsRef.current[n.id()] = { ...n.position() };
      });
    });

    cy.on("dragend", "node", (evt) => {
      const node = evt.target;
      positionsRef.current[node.id()] = { ...node.position() };
    });

    // Node & Edge Selection Listeners
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      selectNode(node.id(), node.data());
    });

    cy.on("tap", "edge", (evt) => {
      const edge = evt.target;
      selectEdge(edge.id(), edge.data());
    });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (cyRef.current) {
          cyRef.current.resize();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
    };
  }, [graphData, selectNode, selectEdge]);

  // 3. Update Stylesheet when theme changes (ZERO position shift)
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.style(getCytoscapeStylesheet(theme === "dark"));
  }, [theme]);

  // 4. Reactive Visibility: Active Case Subgraph + Status Filter + Search Query + Time Scrubber
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    // Resolve target source ID either by hash or exact ID
    const targetHash = CASE_SOURCE_HASH_MAP[activeCase.id];
    const fallbackSourceId = CASE_SOURCE_MAP[activeCase.id];

    // Determine temporal cutoff ratio based on timeline date
    let timeRatio = 1.0;
    if (timeScrubberDate === "2026-02-14") timeRatio = 0.35;
    else if (timeScrubberDate === "2026-02-18") timeRatio = 0.60;
    else if (timeScrubberDate === "2026-02-22") timeRatio = 0.85;
    else if (timeScrubberDate === "2026-02-28" || !timeScrubberDate) timeRatio = 1.0;

    cy.batch(() => {
      // Find matching edges and connected nodes for the active case
      const matchingEdgeIds = new Set<string>();
      const matchingNodeIds = new Set<string>();

      cy.edges().forEach((edge) => {
        const srcId = edge.data("source_id");
        const inScope =
          viewScope === "fusion" ||
          srcId === fallbackSourceId ||
          !fallbackSourceId;
        if (inScope) {
          matchingEdgeIds.add(edge.id());
          matchingNodeIds.add(edge.source().id());
          matchingNodeIds.add(edge.target().id());
        }
      });

      // If no edges matched the fallback ID (e.g. dynamic backend re-seeding), fall back to showing all connected nodes
      if (viewScope === "case" && matchingEdgeIds.size === 0) {
        cy.edges().forEach((edge) => {
          matchingEdgeIds.add(edge.id());
          matchingNodeIds.add(edge.source().id());
          matchingNodeIds.add(edge.target().id());
        });
      }

      const allNodes = cy.nodes();
      const totalNodes = allNodes.length;
      const maxVisibleIndex = Math.ceil(totalNodes * timeRatio);

      allNodes.forEach((node, idx) => {
        const inScope = viewScope === "fusion" || matchingNodeIds.has(node.id());
        const normStatus = node.data("normalized_status") || "PENDING";
        const matchesStatus =
          verificationFilter === "ALL" || normStatus === verificationFilter;

        const label = (node.data("label") || "").toLowerCase();
        const type = (node.data("type") || node.data("entity_type") || "").toLowerCase();
        const query = searchQuery ? searchQuery.toLowerCase().trim() : "";
        const matchesSearch = !query || label.includes(query) || type.includes(query);

        const matchesTimeline = idx < maxVisibleIndex;

        const isVisible = inScope && matchesStatus && matchesSearch && matchesTimeline;
        node.style("display", isVisible ? "element" : "none");
      });

      cy.edges().forEach((edge) => {
        const inScope = viewScope === "fusion" || matchingEdgeIds.has(edge.id());
        const normStatus = edge.data("normalized_status") || "PENDING";
        const matchesStatus =
          verificationFilter === "ALL" || normStatus === verificationFilter;

        const srcVisible = edge.source().style("display") !== "none";
        const tgtVisible = edge.target().style("display") !== "none";

        const isVisible = inScope && matchesStatus && srcVisible && tgtVisible;
        edge.style("display", isVisible ? "element" : "none");
      });
    });

    // Smoothly fit visible elements
    const visibleElements = cy.elements(":visible");
    if (visibleElements.length > 0) {
      cy.animate(
        {
          fit: { eles: visibleElements, padding: 50 },
        },
        { duration: 400 }
      );
    }
  }, [activeCase, viewScope, verificationFilter, searchQuery, timeScrubberDate]);

  // 5. Reactive Weak-Signal Overlay Toggle (ZERO position shift)
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.batch(() => {
      if (signalOverlayEnabled) {
        cy.nodes().forEach((node) => {
          const deg = node.degree();
          const type = (node.data("type") || node.data("entity_type") || "").toUpperCase();
          if (deg >= 2 || type === "ORGANIZATION" || type === "VESSEL") {
            node.addClass("signal-broker");
          }
        });
        cy.edges().forEach((edge) => {
          const conf = edge.data("confidence") || 0;
          if (conf >= 0.8) {
            edge.addClass("signal-anomalous");
          }
        });
      } else {
        cy.nodes().removeClass("signal-broker");
        cy.edges().removeClass("signal-anomalous");
      }
    });
  }, [signalOverlayEnabled]);

  // 6. React to focused node from Inspector or Evidence Viewer
  useEffect(() => {
    if (!cyRef.current || !focusedNodeId) return;
    const cy = cyRef.current;
    const target = cy.getElementById(focusedNodeId);
    if (target.length > 0) {
      cy.elements().removeClass("focused-pulse");
      target.addClass("focused-pulse");
      cy.animate(
        {
          center: { eles: target },
          zoom: Math.max(cy.zoom(), 1.4),
        },
        { duration: 350 }
      );
    }
  }, [focusedNodeId]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 50);

  return (
    <div className="flex-1 flex flex-col relative h-full w-full overflow-hidden select-none">
      {/* Canvas Top Toolbar */}
      <div className="min-h-10 px-4 py-1.5 border-b border-workbench-border bg-workbench-surface/90 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0 z-10 overflow-x-auto">
        {/* Left: Verification Filter Chips & Case/Fusion Scope */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Subgraph vs Full Syndicate Fusion Toggle */}
          <div className="flex items-center rounded border border-workbench-border bg-workbench-panel p-0.5 text-[10px] font-mono shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setViewScope("case")}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap leading-none ${
                viewScope === "case"
                  ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40"
                  : "text-workbench-muted hover:text-workbench-text"
              }`}
            >
              <GitBranch className="w-3 h-3 shrink-0" />
              <span>Case Subgraph</span>
            </button>
            <button
              type="button"
              onClick={() => setViewScope("fusion")}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap leading-none ${
                viewScope === "fusion"
                  ? "bg-workbench-accent text-slate-950 font-bold shadow-sm"
                  : "text-workbench-muted hover:text-workbench-text"
              }`}
            >
              <Network className="w-3 h-3 shrink-0" />
              <span>Full Fusion</span>
            </button>
          </div>

          <span className="h-4 w-px bg-workbench-border hidden md:block shrink-0" />

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 shrink-0">
            {(["ALL", "APPROVED", "PENDING", "DISPUTED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setVerificationFilter(st)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors shrink-0 whitespace-nowrap leading-none ${
                  verificationFilter === st
                    ? "bg-workbench-accent text-slate-950 font-bold shadow-sm"
                    : "bg-workbench-panel text-workbench-muted hover:text-workbench-text border border-workbench-border"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Weak-Signal Overlay Toggle & Canvas Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Signal Overlay Toggle */}
          <button
            type="button"
            onClick={toggleSignalOverlay}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border shrink-0 whitespace-nowrap leading-none ${
              signalOverlayEnabled
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md font-extrabold"
                : "bg-workbench-panel text-workbench-muted border-workbench-border hover:text-workbench-text"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 shrink-0 ${signalOverlayEnabled ? "animate-pulse" : ""}`} />
            <span className="hidden sm:inline">
              {signalOverlayEnabled ? "Radar: ACTIVE" : "Radar Overlay"}
            </span>
            <span className="sm:hidden">Radar</span>
          </button>

          {/* Zoom, Fit & Refresh (NEVER scrambles orientation) */}
          <div className="flex items-center rounded border border-workbench-border bg-workbench-panel p-0.5">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFit}
              title="Fit to Screen"
              className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh Graph Data (Maintains Orientation)"
              className="p-1 rounded text-workbench-muted hover:text-workbench-text hover:bg-workbench-hover transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area - Container is ALWAYS rendered to avoid React removeChild errors */}
      <div className="flex-1 relative w-full h-full">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 space-y-4 bg-workbench-bg/80 backdrop-blur-sm">
            <RefreshCw className="w-8 h-8 text-workbench-accent animate-spin" />
            <span className="text-xs font-mono text-workbench-muted">
              Synchronizing Knowledge Graph Topology...
            </span>
          </div>
        )}

        {/* Empty State Overlay */}
        {!loading && graphData.nodes.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <EmptyState
              icon="graph"
              title="Knowledge Graph Empty"
              description="No entities have been extracted yet. Ingest documents via the left rail to populate the intelligence graph."
            />
          </div>
        )}

        {/* Cytoscape DOM container */}
        <div ref={containerRef} className="w-full h-full cytoscape-container bg-workbench-bg" />

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-3 left-3 rounded-lg border border-workbench-border bg-workbench-surface/90 backdrop-blur-md p-2.5 text-[10px] font-mono text-workbench-muted space-y-1 shadow-lg pointer-events-none z-10 hidden sm:block">
          <div className="font-bold uppercase text-workbench-text text-[9px] tracking-wider mb-1 flex items-center justify-between">
            <span>{viewScope === "case" ? `Active Case: ${activeCase.title.split("&")[0].trim()}` : "Full Syndicate Fusion"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-500" />
              <span>Org</span>
            </span>
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rotate-45 bg-indigo-500/30 border border-indigo-500" />
              <span>Vessel</span>
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500" />
              <span>Location</span>
            </span>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/30 border border-purple-500" />
              <span>Person</span>
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-workbench-border/50 text-[9px]">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <span className="w-3 border-b-2 border-emerald-500" />
              <span>Solid: Approved</span>
            </span>
            <span className="flex items-center gap-1 text-sky-500 font-semibold">
              <span className="w-3 border-b-2 border-dashed border-sky-500" />
              <span>Dash: Pending</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
