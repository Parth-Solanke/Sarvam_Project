import cytoscape from "cytoscape";

export const getCytoscapeStylesheet = (isDark: boolean): any[] => {
  const textColor = isDark ? "#E2E8F0" : "#0F172A";
  const edgeColor = isDark ? "#4B5563" : "#94A3B8";
  const edgeLabelColor = isDark ? "#9CA3AF" : "#64748B";

  return [
    // Base Node Style
    {
      selector: "node",
      style: {
        label: "data(label)",
        color: textColor,
        "font-size": "11px",
        "font-family": "Inter, sans-serif",
        "font-weight": 600,
        "text-valign": "bottom",
        "text-margin-y": 8,
        "text-wrap": "wrap",
        "text-max-width": "110px",
        "text-background-opacity": isDark ? 0.85 : 0.9,
        "text-background-color": isDark ? "#10141B" : "#FFFFFF",
        "text-background-padding": "3px",
        "text-background-shape": "roundrectangle",
        width: 38,
        height: 38,
        "background-color": isDark ? "#151B24" : "#F1F5F9",
        "border-width": 2.5,
        "border-color": "#388BFD",
        "overlay-padding": 5,
        "z-index": 15,
        "transition-property": "background-color, border-color, width, height, border-width",
        "transition-duration": 180,
      },
    },

    // Entity Type Colors & Border
    {
      selector: "node[type = 'ORGANIZATION']",
      style: {
        "border-color": isDark ? "#22D3EE" : "#0891B2",
        "background-color": isDark ? "rgba(34, 211, 238, 0.2)" : "rgba(8, 145, 178, 0.15)",
      },
    },
    {
      selector: "node[type = 'PERSON']",
      style: {
        "border-color": isDark ? "#34D399" : "#059669",
        "background-color": isDark ? "rgba(52, 211, 153, 0.2)" : "rgba(16, 185, 129, 0.15)",
      },
    },
    {
      selector: "node[type = 'LOCATION']",
      style: {
        "border-color": isDark ? "#FBBF24" : "#D97706",
        "background-color": isDark ? "rgba(251, 191, 36, 0.2)" : "rgba(245, 158, 11, 0.15)",
      },
    },
    {
      selector: "node[type = 'VESSEL']",
      style: {
        "border-color": isDark ? "#818CF8" : "#4F46E5",
        "background-color": isDark ? "rgba(129, 140, 248, 0.2)" : "rgba(99, 102, 241, 0.15)",
        shape: "round-diamond",
        width: 42,
        height: 42,
      },
    },
    {
      selector: "node[type = 'EVENT']",
      style: {
        "border-color": isDark ? "#FB7185" : "#E11D48",
        "background-color": isDark ? "rgba(251, 113, 133, 0.2)" : "rgba(244, 63, 94, 0.15)",
      },
    },
    {
      selector: "node[type = 'INFRASTRUCTURE']",
      style: {
        "border-color": isDark ? "#C084FC" : "#9333EA",
        "background-color": isDark ? "rgba(192, 132, 252, 0.2)" : "rgba(168, 85, 247, 0.15)",
        shape: "round-hexagon",
      },
    },

    // Verification Status Styling on Nodes
    {
      selector: "node[verification_status = 'APPROVED'], node[resolution_status = 'RESOLVED']",
      style: {
        "border-style": "solid",
        "border-width": 3,
      },
    },
    {
      selector: "node[verification_status = 'PENDING'], node[resolution_status = 'UNRESOLVED']",
      style: {
        "border-style": "dashed",
        "border-dash-pattern": [5, 4],
        "border-width": 2,
      },
    },
    {
      selector: "node[verification_status = 'DISPUTED'], node[resolution_status = 'DISPUTED']",
      style: {
        "border-color": isDark ? "#F59E0B" : "#D97706",
        "background-color": isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(217, 119, 6, 0.25)",
        "border-style": "solid",
        "border-width": 3.5,
      },
    },
    {
      selector: "node[verification_status = 'REJECTED'], node[resolution_status = 'REJECTED']",
      style: {
        opacity: 0.35,
        "border-color": isDark ? "#EF4444" : "#DC2626",
      },
    },

    // Selected & Focused Nodes
    {
      selector: "node:selected, node.selected",
      style: {
        "border-color": "#F59E0B",
        "border-width": 4,
        width: 48,
        height: 48,
        "shadow-blur": 15,
        "shadow-color": "#F59E0B",
        "shadow-opacity": 0.6,
      },
    },
    {
      selector: "node.focused-pulse",
      style: {
        "border-color": "#22D3EE",
        "border-width": 5,
        "shadow-blur": 25,
        "shadow-color": "#22D3EE",
        "shadow-opacity": 0.9,
      },
    },

    // Active Case Focal Highlight
    {
      selector: "node.case-focal",
      style: {
        "border-color": "#22D3EE",
        "border-width": 4.5,
        "shadow-blur": 22,
        "shadow-color": "rgba(34, 211, 238, 0.75)",
        "shadow-opacity": 0.9,
        "z-index": 25,
      },
    },

    // Weak-Signal Centrality Sizing & Broker Highlighting
    {
      selector: "node.signal-broker",
      style: {
        width: 56,
        height: 56,
        "border-color": "#F59E0B",
        "border-width": 4.5,
        "border-style": "solid",
        "background-color": isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(245, 158, 11, 0.25)",
        "shadow-blur": 25,
        "shadow-color": "#F59E0B",
        "shadow-opacity": 0.85,
        "z-index": 30,
      },
    },

    // Base Edge Style
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": edgeColor,
        "target-arrow-color": edgeColor,
        "target-arrow-shape": "triangle",
        "target-distance-from-node": 6,
        "source-distance-from-node": 6,
        "curve-style": "bezier",
        "arrow-scale": 1.15,
        label: "data(label)",
        "font-size": "9px",
        "font-family": "Inter, sans-serif",
        color: edgeLabelColor,
        "text-background-opacity": isDark ? 0.9 : 0.95,
        "text-background-color": isDark ? "#0A0D12" : "#FFFFFF",
        "text-background-padding": "3px",
        "text-background-shape": "roundrectangle",
        "text-rotation": "autorotate",
        "z-index": 5,
        "transition-property": "width, line-color, target-arrow-color, opacity",
        "transition-duration": 180,
      },
    },

    // Verification Status on Edges
    {
      selector: "edge[verification_status = 'VERIFIED'], edge[verification_status = 'APPROVED']",
      style: {
        "line-style": "solid",
        width: 2.5,
        "line-color": isDark ? "#10B981" : "#059669",
        "target-arrow-color": isDark ? "#10B981" : "#059669",
      },
    },
    {
      selector: "edge[verification_status = 'PENDING']",
      style: {
        "line-style": "dashed",
        "line-dash-pattern": [6, 4],
        width: 2,
        "line-color": isDark ? "#388BFD" : "#0284C7",
        "target-arrow-color": isDark ? "#388BFD" : "#0284C7",
      },
    },
    {
      selector: "edge[verification_status = 'DISPUTED']",
      style: {
        "line-style": "dashed",
        "line-dash-pattern": [4, 4],
        width: 3,
        "line-color": isDark ? "#F59E0B" : "#D97706",
        "target-arrow-color": isDark ? "#F59E0B" : "#D97706",
      },
    },
    {
      selector: "edge[verification_status = 'REJECTED']",
      style: {
        opacity: 0.3,
        "line-style": "dashed",
        "line-color": isDark ? "#EF4444" : "#DC2626",
        "target-arrow-color": isDark ? "#EF4444" : "#DC2626",
      },
    },

    // Weak-Signal Anomalous Edges (Pulsing Dashed Amber)
    {
      selector: "edge.signal-anomalous",
      style: {
        width: 3.5,
        "line-style": "dashed",
        "line-dash-pattern": [6, 4],
        "line-color": "#F59E0B",
        "target-arrow-color": "#F59E0B",
        "arrow-scale": 1.4,
        "shadow-blur": 15,
        "shadow-color": "#F59E0B",
        "shadow-opacity": 0.8,
        "z-index": 20,
      },
    },

    // Edge Selected
    {
      selector: "edge:selected, edge.selected",
      style: {
        width: 4,
        "line-color": "#F59E0B",
        "target-arrow-color": "#F59E0B",
      },
    },
  ];
};

