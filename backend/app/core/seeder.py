import json
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.models.sql.models import User, Source
from backend.app.core.security import hash_password
from backend.app.models.schemas.schemas import SourceIngestRequest
from backend.app.api.v1.sources import ingest_source

SAMPLE_INTELLIGENCE = [
    {
        "title": "Maritime Alert: Suspicious STS Fuel Transfers in Gulf of Oman",
        "source_type": "URL",
        "source_uri": "https://intel.maritime-bulletin.org/reports/2026-sts-oman",
        "content": (
            "On 14 Feb 2026, satellite surveillance observed MT Caspian Star conducting an unannounced "
            "ship-to-ship (STS) cargo transfer with MV Ocean Pioneer off the coast of Fujairah. "
            "MT Caspian Star is operated by BlueWave Maritime Ltd, an entity registered in Dubai. "
            "Following the transfer, MV Ocean Pioneer altered its AIS broadcast heading towards Mumbai port. "
            "The Dubai Maritime Authority has initiated an inquiry into unauthorized transshipment activities."
        )
    },
    {
        "title": "मुंबई बंदरगाह सीमा शुल्क निरीक्षण रिपोर्ट (Mumbai Port Customs Inspection)",
        "source_type": "MANUAL_REPORT",
        "source_uri": "https://gov.in/customs/mumbai/inspections/2026-02",
        "content": (
            "दिनांक 18 फरवरी 2026 को मुंबई बंदरगाह (Mumbai) पर पहुंचे MV Ocean Pioneer के कार्गो मैनिफेस्ट की "
            "गहन जांच की गई। यह जहाज BlueWave Maritime Ltd के साथ अनुबंधित पाया गया। "
            "सीमा शुल्क अधिकारियों ने पाया कि दस्तावेज़ों में उल्लिखित मूल स्थान और Fujairah में हुए STS ट्रांसफर "
            "के बीच विसंगतियां हैं। सुरक्षा एजेंसी और Indian Ocean Logistics Group द्वारा मामले की समीक्षा की जा रही है।"
        )
    },
    {
        "title": "Corporate Network Analysis: Shadow Fleet Logistics Intermediaries",
        "source_type": "PDF",
        "source_uri": "file:///data/reports/shadow_fleet_corporate_brief.pdf",
        "content": (
            "An investigation into regional bunkering networks reveals that BlueWave Maritime Ltd "
            "shares beneficial ownership and corporate directors with Indian Ocean Logistics Group. "
            "Both companies utilize financial services through Apex Commercial Bank in Singapore. "
            "Vessel records show MT Caspian Star frequently berthed at Colombo port prior to Gulf operations. "
            "Apex Commercial Bank flagged multiple high-frequency transactions between Colombo and Dubai."
        )
    }
]

async def seed_initial_data(db: AsyncSession):
    """Ensure baseline analyst user and seed multi-source intelligence exist."""
    # 1. Seed Analyst User
    user_stmt = select(User).where(User.email == "analyst@workbench.osint")
    res = await db.execute(user_stmt)
    analyst = res.scalar_one_or_none()
    
    if not analyst:
        analyst = User(
            email="analyst@workbench.osint",
            hashed_password=hash_password("osint_analyst_2026"),
            full_name="Lead Analyst",
            role="SENIOR_ANALYST",
            is_active=True
        )
        db.add(analyst)
        await db.commit()
        await db.refresh(analyst)

    # 2. Check if Sources already exist
    source_count_res = await db.execute(select(Source))
    if not source_count_res.scalars().first():
        for item in SAMPLE_INTELLIGENCE:
            req = SourceIngestRequest(
                title=item["title"],
                source_type=item["source_type"],
                source_uri=item["source_uri"],
                content=item["content"]
            )
            await ingest_source(req=req, db=db, current_user=analyst)

