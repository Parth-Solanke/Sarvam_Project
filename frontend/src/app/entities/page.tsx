"use client";

import { useEffect, useState } from "react";
import { api, EntityItem } from "@/lib/api";
import { Users, Search, ShieldCheck, Link2, ExternalLink, Filter } from "lucide-react";

export default function EntitiesPage() {
  const [entities, setEntities] = useState<EntityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEntities().then((data) => {
      setEntities(data);
      setLoading(false);
    });
  }, []);

  const filtered = entities.filter((e) => {
    const matchType = filterType === "ALL" || e.entity_type === filterType;
    const matchSearch = e.canonical_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-workbench-text flex items-center gap-2">
            <Users className="w-5 h-5 text-workbench-purple" />
            <span>Entity Profiles & Disambiguation</span>
          </h2>
          <p className="text-xs text-workbench-muted font-mono mt-0.5">
            Discovered persons, organizations, locations, and infrastructure nodes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg bg-workbench-surface border border-workbench-border flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-workbench-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search canonical entities or aliases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-workbench-panel border border-workbench-border rounded px-3 pl-9 py-2 text-xs text-workbench-text placeholder-workbench-muted focus:outline-none focus:border-workbench-accent font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-workbench-muted" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-workbench-panel border border-workbench-border rounded px-3 py-2 text-xs text-workbench-text focus:outline-none focus:border-workbench-accent font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="ORGANIZATION">Organization</option>
            <option value="LOCATION">Location</option>
            <option value="INFRASTRUCTURE">Infrastructure / Vessel</option>
            <option value="PERSON">Person</option>
            <option value="DATE">Date / Event</option>
          </select>
        </div>
      </div>

      {/* Entity Table */}
      <div className="rounded-lg bg-workbench-surface border border-workbench-border overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-workbench-panel border-b border-workbench-border text-[11px] text-workbench-muted uppercase">
            <tr>
              <th className="p-3.5">Canonical Entity</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Extraction Confidence</th>
              <th className="p-3.5">Resolution Status</th>
              <th className="p-3.5">Total Mentions</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-workbench-border/50">
            {filtered.map((ent) => (
              <tr key={ent.id} className="hover:bg-workbench-hover/40 transition-colors">
                <td className="p-3.5 font-semibold text-workbench-text">
                  <div className="flex items-center gap-2">
                    <span>{ent.canonical_name}</span>
                    {ent.original_script_name && (
                      <span className="text-[10px] text-workbench-purple">({ent.original_script_name})</span>
                    )}
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-workbench-panel border border-workbench-border text-workbench-accent">
                    {ent.entity_type}
                  </span>
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-workbench-panel overflow-hidden">
                      <div
                        className="h-full bg-workbench-success rounded-full"
                        style={{ width: `${(ent.confidence_score || 0.9) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-workbench-muted">
                      {((ent.confidence_score || 0.9) * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-workbench-success/15 text-workbench-success border border-workbench-success/30">
                    {ent.resolution_status}
                  </span>
                </td>
                <td className="p-3.5 text-workbench-muted">{ent.mention_count || 1} occurrences</td>
                <td className="p-3.5 text-right">
                  <a
                    href={`/graph`}
                    className="inline-flex items-center gap-1 text-workbench-accent hover:underline text-[11px]"
                  >
                    <span>View in Graph</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

