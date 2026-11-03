import json
import logging
from typing import AsyncGenerator, Optional, Dict, Any, List
import networkx as nx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from neo4j import AsyncGraphDatabase, AsyncDriver

from backend.app.core.config import settings
from backend.app.models.sql.models import Base

logger = logging.getLogger("osint.database")

# 1. Async SQLAlchemy Engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Create all relational tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Relational database schema initialized.")

# 2. Resilient Graph Engine (Neo4j + NetworkX Local Fallback)
class HybridGraphStore:
    def __init__(self):
        self.driver: Optional[AsyncDriver] = None
        self.use_neo4j: bool = False
        self.local_graph: nx.MultiDiGraph = nx.MultiDiGraph()
    
    async def connect(self):
        try:
            self.driver = AsyncGraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            await self.driver.verify_connectivity()
            self.use_neo4j = True
            logger.info("Connected to remote Neo4j Knowledge Graph at %s", settings.NEO4J_URI)
        except Exception as e:
            self.use_neo4j = False
            logger.warning("Neo4j not reachable (%s). Falling back to resilient embedded NetworkX graph engine.", str(e))

    async def close(self):
        if self.driver:
            await self.driver.close()

    async def add_node(self, node_id: str, label: str, properties: Dict[str, Any]):
        """Upsert a node into Neo4j or embedded graph."""
        if self.use_neo4j and self.driver:
            query = f"""
            MERGE (n:{label} {{id: $id}})
            SET n += $props
            RETURN n.id
            """
            async with self.driver.session() as session:
                await session.run(query, id=node_id, props=properties)
        
        # Always maintain in local graph for sub-millisecond local network analytics & fallback
        props = properties.copy()
        props["label"] = label
        props["id"] = node_id
        self.local_graph.add_node(node_id, **props)

    async def add_relationship(
        self,
        source_id: str,
        target_id: str,
        rel_type: str,
        properties: Dict[str, Any]
    ):
        """Upsert a directed relationship."""
        if self.use_neo4j and self.driver:
            query = f"""
            MATCH (a {{id: $source_id}}), (b {{id: $target_id}})
            MERGE (a)-[r:{rel_type}]->(b)
            SET r += $props
            RETURN type(r)
            """
            async with self.driver.session() as session:
                await session.run(query, source_id=source_id, target_id=target_id, props=properties)

        self.local_graph.add_edge(source_id, target_id, key=rel_type, rel_type=rel_type, **properties)

    async def sync_from_database(self, db: AsyncSession):
        """Hydrate graph store from persistent relational storage."""
        from backend.app.models.sql.models import ExtractedEntity, ExtractedRelationship, ExtractionEvidence, Source
        from sqlalchemy import select
        
        # Load Entities
        e_stmt = select(ExtractedEntity)
        e_res = await db.execute(e_stmt)
        for e in e_res.scalars().all():
            self.local_graph.add_node(
                e.id,
                id=e.id,
                canonical_name=e.canonical_name,
                label=e.canonical_name,
                entity_type=e.entity_type,
                type=e.entity_type,
                confidence=e.confidence_score,
                verification_status=e.resolution_status
            )

        # Load Relationships
        r_stmt = (
            select(ExtractedRelationship, ExtractionEvidence, Source.title)
            .outerjoin(ExtractionEvidence, ExtractedRelationship.id == ExtractionEvidence.relationship_id)
            .outerjoin(Source, ExtractionEvidence.source_id == Source.id)
        )
        r_res = await db.execute(r_stmt)
        for rel, evi, s_title in r_res.all():
            self.local_graph.add_edge(
                rel.source_entity_id,
                rel.target_entity_id,
                key=rel.relation_type,
                rel_type=rel.relation_type,
                relationship_id=rel.id,
                confidence=rel.confidence,
                quote=evi.quote_verbatim if evi else "Observed connection",
                source_title=s_title or "Primary Ingestion",
                verification_status=rel.verification_status
            )

    async def get_subgraph(self, center_id: Optional[str] = None, radius: int = 2, limit: int = 100) -> Dict[str, Any]:
        """Fetch nodes and edges for Cytoscape visualization."""
        nodes = []
        edges = []
        
        if center_id and center_id in self.local_graph:
            sub_nodes = set([center_id])
            current_layer = set([center_id])
            for _ in range(radius):
                next_layer = set()
                for n in current_layer:
                    next_layer.update(self.local_graph.neighbors(n))
                    next_layer.update(self.local_graph.predecessors(n))
                sub_nodes.update(next_layer)
                current_layer = next_layer
            selected_nodes = list(sub_nodes)[:limit]
        else:
            selected_nodes = list(self.local_graph.nodes())[:limit]

        node_set = set(selected_nodes)
        for n_id in node_set:
            data = self.local_graph.nodes[n_id]
            canonical = data.get("canonical_name", n_id)
            node_type = data.get("entity_type", data.get("label", "Entity"))
            nodes.append({
                "data": {
                    **data,
                    "id": n_id,
                    "label": canonical,
                    "canonical_name": canonical,
                    "type": node_type
                }
            })

        for u, v, k, d in self.local_graph.edges(selected_nodes, data=True, keys=True):
            if v in node_set:
                edges.append({
                    "data": {
                        "id": f"{u}_{k}_{v}",
                        "source": u,
                        "target": v,
                        "label": d.get("rel_type", "RELATED_TO"),
                        **d
                    }
                })

        return {"nodes": nodes, "edges": edges}

    async def find_shortest_path(self, source_id: str, target_id: str) -> List[str]:
        """Compute shortest path between two entities."""
        try:
            return nx.shortest_path(self.local_graph.to_undirected(), source=source_id, target=target_id)
        except Exception:
            return []

    async def get_communities(self) -> List[List[str]]:
        """Run Louvain community clustering to find covert networks."""
        try:
            undirected = self.local_graph.to_undirected()
            if len(undirected.nodes()) < 2:
                return []
            import networkx.algorithms.community as nx_comm
            communities = nx_comm.louvain_communities(undirected)
            return [list(c) for c in communities]
        except Exception:
            return []

graph_store = HybridGraphStore()
