import json
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.models.sql.models import SignalAnomaly
from backend.app.services.analytics.signals import weak_signal_engine

router = APIRouter(prefix="/signals", tags=["Weak-Signal & Anomaly Detection"])

@router.get("", response_model=List[dict])
async def list_signals(db: AsyncSession = Depends(get_db)):
    """List all detected signals, temporal anomalies, and co-occurrences."""
    # 1. Fetch persistent anomalies
    stmt = select(SignalAnomaly).order_by(SignalAnomaly.created_at.desc())
    res = await db.execute(stmt)
    records = res.scalars().all()
    
    # 2. Also run live statistical graph scan
    live_signals = await weak_signal_engine.run_analysis()
    
    combined = []
    for r in records:
        combined.append({
            "id": r.id,
            "signal_type": r.signal_type,
            "title": r.title,
            "explanation": r.explanation,
            "metrics": json.loads(r.metrics_json or "{}"),
            "verification_status": r.verification_status,
            "created_at": r.created_at.isoformat()
        })
        
    for s in live_signals:
        combined.append({
            "id": f"live_{s['signal_type']}_{hash(s['title']) % 10000}",
            "signal_type": s["signal_type"],
            "title": s["title"],
            "explanation": s["explanation"],
            "alternative_interpretations": s.get("alternative_interpretations", ""),
            "supporting_evidence": s.get("supporting_evidence", ""),
            "metrics": s.get("metrics", {}),
            "verification_status": s["verification_status"],
            "confidence": s["confidence"]
        })
        
    return combined

@router.post("/scan")
async def trigger_scan():
    """Trigger an on-demand statistical anomaly scan across the graph."""
    signals = await weak_signal_engine.run_analysis()
    return {"status": "SUCCESS", "detected_signals": len(signals), "signals": signals}

