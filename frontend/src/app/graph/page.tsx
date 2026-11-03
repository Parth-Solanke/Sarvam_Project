"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { api, GraphData } from "@/lib/api";
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  ShieldCheck,
  X,
  Layers
} from "lucide-react";

export default function KnowledgeGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGraph() {
      try {
        const data = await api.getGraph();
        setGraphData(data);
      } catch (err) {
        console.error("Failed to load knowledge graph:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, []);

  useEffect(() => {
    if (!containerRef.current || graphData.nodes.length === 0) return;

    // Filter nodes if needed
    const filteredNodes = filterType === "ALL" 
      ? graphData.nodes 
      : graphData.nodes.filter(n => n.data.type === filterType);
    
    const nodeIds = new Set(filteredNodes.map(n => n.data.id));
    const filteredEdges = graphData.edges.filter(e => nodeIds.has(e.data.source) && nodeIds.has(e.data.target));

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...filteredNodes, ...filteredEdges],
      style: [
        {
          selector: "node",
          style: {
            "label": "data(label)",
            "color": "#E2E8F0",
            "font-size": "11px",
            "font-family": "monospace",
            "text-valign": "bottom",
            "text-margin-y": 6,
            "background-color": (ele: any) => {
              const type = ele.data("type");
              if (type === "ORGANIZATION") return "#388BFD";
              if (type === "LOCATION") return "#2EA043";
              if (type === "INFRASTRUCTURE") return "#F0883E";
              if (type === "PERSON") return "#A371F7";
              return "#8B949E";
            },
            "width": 32,
            "height": 32,
            "border-width": 2,
            "border-color": "#262E3D",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#FFFFFF",
            "border-width": 4,
            "overlay-color": "#388BFD",
            "overlay-opacity": 0.3,
            "overlay-padding": 6,
          },
        },
        {
          selector: "edge",
          style: {
            "label": "data(label)",
            "font-size": "9px",
            "font-family": "monospace",
            "color": "#8B949E",
            "text-background-color": "#12161F",
            "text-background-opacity": 0.85,
            "text-background-padding": "2px",
            "width": 2,
            "line-color": "#3F4752",
            "target-arrow-color": "#6E7681",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#388BFD",
            "target-arrow-color": "#388BFD",
            "width": 3.5,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 600,
        nodeRepulsion: () => 450000,
        idealEdgeLength: () => 90,
      },
    });

    cy.on("tap", "node", (evt) => {
      setSelectedEdge(null);
      setSelectedNode(evt.target.data());
    });

    cy.on("tap", "edge", (evt) => {
      setSelectedNode(null);
      setSelectedEdge(evt.target.data());
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData, filterType]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!cyRef.current || !term) return;

    cyRef.current.nodes().forEach((node) => {
      const match = node.data("label").toLowerCase().includes(term.toLowerCase());
      if (match) {
        node.select();
        cyRef.current?.animate({
          center: { eles: node },
          zoom: 1.5,
          duration: 400,
        });
      } else {
        node.unselect();
      }
    });
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Control Header */}
      <div className="flex items-center justify-between bg-workbench-surface border border-workbench-border p-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-workbench-text font-semibold text-sm">
            <Network className="w-4 h-4 text-workbench-accent" />
            <span>Interactive Knowledge Graph</span>
          </div>
          <span className="text-xs font-mono text-workbench-muted">
            ({graphData.nodes.length} Nodes // {graphData.edges.length} Relationships)
          </span>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-workbench-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-workbench-panel border border-workbench-border rounded px-2.5 pl-8 py-1 text-xs text-workbench-text placeholder-workbench-muted focus:outline-none focus:border-workbench-accent w-56 font-mono"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-workbench-panel border border-workbench-border rounded px-2.5 py-1 text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono"
          >
            <option value="ALL">All Types</option>
            <option value="ORGANIZATION">Organizations</option>
            <option value="LOCATION">Locations / Ports</option>
            <option value="INFRASTRUCTURE">Vessels / Infrastructure</option>
            <option value="PERSON">Persons</option>
          </select>

          <button
            onClick={() => cyRef.current?.fit()}
            className="p-1.5 rounded bg-workbench-panel border border-workbench-border hover:border-workbench-accent text-workbench-text"
            title="Reset Zoom / Fit Graph"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas and Detail Drawer */}
      <div className="flex-1 relative rounded-lg border border-workbench-border bg-workbench-surface overflow-hidden">
        {/* Cytoscape Canvas */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 p-3 rounded bg-workbench-surface/90 border border-workbench-border backdrop-blur-sm space-y-1.5 text-xs font-mono">
          <span className="text-[10px] text-workbench-muted uppercase font-bold block mb-1">Entity Categories</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#388BFD]" />
            <span className="text-workbench-text">Organization</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2EA043]" />
            <span className="text-workbench-text">Location / Port</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0883E]" />
            <span className="text-workbench-text">Vessel / Infrastructure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A371F7]" />
            <span className="text-workbench-text">Person</span>
          </div>
        </div>

        {/* Node Inspector Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 p-4 rounded-lg bg-workbench-surface/95 border border-workbench-border shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-workbench-border">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-workbench-accent/15 text-workbench-accent uppercase">
                  {selectedNode.type}
                </span>
                <span className="text-xs font-mono text-workbench-success">● Active</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-workbench-muted hover:text-workbench-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-workbench-text">{selectedNode.label}</h3>
              <p className="text-[11px] font-mono text-workbench-muted mt-0.5">ID: {selectedNode.id}</p>
            </div>

            <div className="p-2.5 rounded bg-workbench-panel border border-workbench-border text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-workbench-muted">Confidence:</span>
                <span className="text-workbench-text">{((selectedNode.confidence || 0.9) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-workbench-muted">Verification:</span>
                <span className="text-workbench-success">{selectedNode.verification_status || "VERIFIED"}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`/entities`}
                className="w-full block text-center py-1.5 rounded bg-workbench-panel border border-workbench-border hover:border-workbench-accent text-xs font-semibold text-workbench-accent"
              >
                Inspect Full Dossier
              </a>
            </div>
          </div>
        )}

        {/* Edge / Evidence Inspector Drawer */}
        {selectedEdge && (
          <div className="absolute top-4 right-4 w-96 p-4 rounded-lg bg-workbench-surface/95 border border-workbench-accent/50 shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-workbench-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-workbench-accent" />
                <span className="text-xs font-mono font-bold uppercase text-workbench-accent">
                  Traceable Evidence Trail
                </span>
              </div>
              <button onClick={() => setSelectedEdge(null)} className="text-workbench-muted hover:text-workbench-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono text-workbench-muted uppercase">Relationship Assertion</span>
              <h4 className="text-xs font-bold text-workbench-text">
                {selectedEdge.source} → <span className="text-workbench-accent">{selectedEdge.label}</span> → {selectedEdge.target}
              </h4>
            </div>

            {/* Verbatim Source Quote */}
            <div className="p-3 rounded bg-workbench-panel border border-workbench-border space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-workbench-muted">
                <span>PRIMARY SOURCE EVIDENCE</span>
                <span className="text-workbench-success">CONF: {((selectedEdge.confidence || 0.85) * 100).toFixed(0)}%</span>
              </div>
              <blockquote className="text-xs italic text-workbench-text/90 border-l-2 border-workbench-accent pl-2.5 py-0.5">
                "{selectedEdge.quote || "Direct operational relationship documented in primary source."}"
              </blockquote>
              {selectedEdge.source_title && (
                <p className="text-[10px] font-mono text-workbench-muted truncate">
                  Source: {selectedEdge.source_title}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-workbench-muted">Analyst Status:</span>
              <span className="px-2 py-0.5 rounded bg-workbench-warning/15 text-workbench-warning border border-workbench-warning/30">
                {selectedEdge.verification_status || "UNVERIFIED"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
