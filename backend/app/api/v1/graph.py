from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException

from app.core.database import graph_store
from app.models.schemas.schemas import GraphResponse

router = APIRouter(prefix="/graph", tags=["Knowledge Graph Analytics"])

@router.get("/subgraph", response_model=GraphResponse)
async def get_graph_subgraph(
    center_id: Optional[str] = None,
    radius: int = Query(2, ge=1, le=5),
    limit: int = Query(150, ge=1, le=500)
):
    """Retrieve filtered knowledge graph nodes and edges for Cytoscape.js rendering."""
    subgraph = await graph_store.get_subgraph(center_id=center_id, radius=radius, limit=limit)
    return subgraph

@router.get("/path")
async def get_shortest_path(source_id: str, target_id: str):
    """Compute the shortest traceable relational path between two entities."""
    path = await graph_store.find_shortest_path(source_id, target_id)
    if not path:
        return {"path": [], "found": False}
    return {"path": path, "length": len(path) - 1, "found": True}

@router.get("/communities")
async def get_graph_communities():
    """Discover covert network clusters via Louvain modularity algorithm."""
    communities = await graph_store.get_communities()
    return {"communities": communities, "total_clusters": len(communities)}

