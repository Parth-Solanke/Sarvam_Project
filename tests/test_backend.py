import asyncio
import sys
from pathlib import Path

# Force UTF-8 for console output on Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add project root and backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import init_db, graph_store, async_session_maker
from app.core.seeder import seed_initial_data
from app.services.analytics.signals import weak_signal_engine

async def main():
    print("-> 1. Initializing DB Schema...")
    await init_db()
    
    print("-> 2. Connecting Graph Store...")
    await graph_store.connect()
    
    print("-> 3. Seeding Sample OSINT Data & Syncing Graph...")
    async with async_session_maker() as session:
        await seed_initial_data(session)
        await graph_store.sync_from_database(session)
        
    print("-> 4. Verifying Knowledge Graph...")
    subgraph = await graph_store.get_subgraph()
    node_count = len(subgraph["nodes"])
    edge_count = len(subgraph["edges"])
    print(f"   Nodes in Graph: {node_count}")
    print(f"   Edges in Graph: {edge_count}")
    for n in subgraph["nodes"][:5]:
        print(f"   - Node: {n['data']['label']} ({n['data']['type']})")
        
    print("-> 5. Running Weak-Signal Detection Scan...")
    signals = await weak_signal_engine.run_analysis()
    print(f"   Detected Signals: {len(signals)}")
    for s in signals:
        print(f"   - [{s['signal_type']}] {s['title']} (Confidence: {s['confidence']:.2f})")
        print(f"     Explanation: {s['explanation'][:110]}...")

    print("\n[ALL BACKEND SERVICES OPERATING PROPERLY]")

if __name__ == "__main__":
    asyncio.run(main())
