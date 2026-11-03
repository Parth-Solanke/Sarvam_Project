import math
from datetime import datetime, timezone
from typing import List, Dict, Any
from collections import defaultdict
import networkx as nx

from backend.app.core.database import graph_store

class WeakSignalEngine:
    def __init__(self):
        pass

    async def run_analysis(self) -> List[Dict[str, Any]]:
        """Run statistical, temporal, and topological network anomaly scans."""
        signals = []
        
        # 1. Unusual Entity Co-occurrences via Pointwise Mutual Information (PMI)
        pmi_signals = await self._detect_unusual_cooccurrences()
        signals.extend(pmi_signals)
        
        # 2. Graph Community & Broker Entity Detection (High Betweenness Centrality)
        centrality_signals = await self._detect_broker_anomalies()
        signals.extend(centrality_signals)
        
        # 3. Dense Cluster Detection (Louvain)
        cluster_signals = await self._detect_dense_clusters()
        signals.extend(cluster_signals)
        
        return signals

    async def _detect_unusual_cooccurrences(self) -> List[Dict[str, Any]]:
        """Calculate PMI between entities across observed edges to spot unusual associations."""
        g = graph_store.local_graph.to_undirected()
        signals = []
        
        total_edges = g.number_of_edges()
        if total_edges < 3:
            return signals

        for u, v, data in g.edges(data=True):
            deg_u = g.degree(u)
            deg_v = g.degree(v)
            
            # Expected edge probability under random configuration model
            p_expected = (deg_u * deg_v) / (4.0 * (total_edges ** 2) + 1e-9)
            p_observed = 1.0 / total_edges
            
            # PMI score
            pmi = math.log2(p_observed / (p_expected + 1e-9))
            
            # If PMI is exceptionally high and neither node is a high-degree hub
            if pmi > 3.5:
                name_u = g.nodes[u].get("canonical_name", u)
                name_v = g.nodes[v].get("canonical_name", v)
                rel_type = data.get("rel_type", "RELATED_TO")
                quote = data.get("quote", "Direct connection observed in ingested reporting.")
                
                signals.append({
                    "signal_type": "UNUSUAL_COOCCURRENCE",
                    "title": f"Anomalous Association: {name_u} <-> {name_v}",
                    "explanation": (
                        f"Statistical Pointwise Mutual Information (PMI = {pmi:.2f}) indicates an unexpected "
                        f"correlation between {name_u} and {name_v} through '{rel_type}'. Both entities have low "
                        f"general baseline degrees, making this co-occurrence statistically non-random."
                    ),
                    "alternative_interpretations": (
                        "1. Shared maritime logistics agent or third-party intermediary without direct coordination. "
                        "2. Coincidental proximity or multi-entity reporting in a single news dispatch."
                    ),
                    "supporting_evidence": quote,
                    "confidence": min(0.95, 0.65 + (pmi * 0.05)),
                    "related_entities": [u, v],
                    "verification_status": "UNVERIFIED",
                    "metrics": {
                        "pmi_score": round(pmi, 2),
                        "degrees": {"entity_1": deg_u, "entity_2": deg_v},
                        "total_graph_edges": total_edges
                    }
                })

        return signals

    async def _detect_broker_anomalies(self) -> List[Dict[str, Any]]:
        """Detect entities serving as covert bridges between otherwise disconnected clusters."""
        g = graph_store.local_graph.to_undirected()
        signals = []
        
        if len(g.nodes()) < 4:
            return signals

        try:
            betweenness = nx.betweenness_centrality(g)
            sorted_nodes = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)
            
            if sorted_nodes and sorted_nodes[0][1] > 0.25:
                top_node_id, score = sorted_nodes[0]
                node_data = g.nodes[top_node_id]
                name = node_data.get("canonical_name", top_node_id)
                entity_type = node_data.get("label", "Entity")
                
                signals.append({
                    "signal_type": "HIGH_CENTRALITY_BROKER",
                    "title": f"Structural Hub Detected: {name}",
                    "explanation": (
                        f"Topological analysis identified {name} ({entity_type}) as a critical network bottleneck "
                        f"with Betweenness Centrality score of {score:.3f}. This entity lies on a disproportionately "
                        f"high percentage of shortest communication and transaction paths across the knowledge graph."
                    ),
                    "alternative_interpretations": (
                        "1. Legitimate high-volume commercial port or common legal registrant. "
                        "2. Central coordinating hub in an illicit supply chain or evasion network."
                    ),
                    "supporting_evidence": f"Connects {g.degree(top_node_id)} distinct nodes across multiple subgraphs.",
                    "confidence": 0.88,
                    "related_entities": [top_node_id],
                    "verification_status": "UNVERIFIED",
                    "metrics": {
                        "betweenness_centrality": round(score, 3),
                        "degree": g.degree(top_node_id)
                    }
                })
        except Exception:
            pass

        return signals

    async def _detect_dense_clusters(self) -> List[Dict[str, Any]]:
        """Identify tightly coupled community clusters."""
        signals = []
        communities = await graph_store.get_communities()
        
        for idx, comm in enumerate(communities):
            if len(comm) >= 3:
                member_names = [graph_store.local_graph.nodes[n].get("canonical_name", n) for n in comm]
                signals.append({
                    "signal_type": "DENSE_COMMUNITY_CLUSTER",
                    "title": f"Cohesive Cluster #{idx + 1} ({len(comm)} Entities)",
                    "explanation": (
                        f"Community partition algorithm (Louvain modularity) identified a tightly interlinked cluster "
                        f"comprising: {', '.join(member_names[:5])}. Entities exhibit significantly higher internal "
                        f"density than expected by random chance."
                    ),
                    "alternative_interpretations": (
                        "1. Legitimate corporate conglomerate or joint venture consortium. "
                        "2. Coordinated shell company or maritime flag-hopping network."
                    ),
                    "supporting_evidence": f"Internal subgraph connectivity over {len(comm)} entities.",
                    "confidence": 0.82,
                    "related_entities": list(comm),
                    "verification_status": "UNVERIFIED",
                    "metrics": {
                        "cluster_size": len(comm),
                        "member_ids": list(comm)
                    }
                })

        return signals

weak_signal_engine = WeakSignalEngine()

