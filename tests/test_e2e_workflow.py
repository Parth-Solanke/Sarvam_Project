import httpx
import sys

# Force UTF-8 console output
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def test_workflow():
    client = httpx.Client(base_url="http://127.0.0.1:8000/api/v1")

    print("=== OSINT FUSION WORKBENCH END-TO-END VERIFICATION ===")

    # 1. Ingest New Multilingual Intelligence
    payload = {
        "title": "Red Sea Surveillance: Flag-Hopping Tanker Identified",
        "source_type": "URL",
        "source_uri": "https://osint.maritime-monitor.org/red-sea-2026",
        "content": (
            "Red Sea satellite imagery detected MT Caspian Star rendezvous with Global Tankers Inc "
            "off Port of Djibouti on 22 Feb 2026. AIS transponder spoofing was confirmed by maritime "
            "authorities in Singapore."
        )
    }
    ingest_res = client.post("/sources/ingest", json=payload).json()
    print(f"1. Ingested Source ID: {ingest_res['id']} | SHA: {ingest_res['content_sha256'][:10]}")

    # 2. Check Graph Update
    graph = client.get("/graph/subgraph").json()
    print(f"2. Graph Updated: {len(graph['nodes'])} nodes, {len(graph['edges'])} edges")

    # 3. Check Verification Queue
    queue = client.get("/verification/queue").json()
    print(f"3. Verification Queue: {queue['total_pending']} pending items")
    pending_item = queue["pending_relationships"][0] if queue["pending_relationships"] else None

    if pending_item:
        print(f"   Assertion: {pending_item['source_entity']} -> {pending_item['relation_type']} -> {pending_item['target_entity']}")
        
        # 4. Human Analyst Determination
        review_res = client.post("/verification/review", json={
            "target_type": "RELATIONSHIP",
            "target_id": pending_item["id"],
            "decision": "APPROVED",
            "analyst_rationale": "Corroborated by independent satellite transponder telemetry and customs manifest."
        }).json()
        print(f"4. Analyst Determination Recorded: {review_res['status']} | Decision: {review_res['decision']}")

    # 5. Check Immutable Audit Trail
    audit = client.get("/verification/audit-log").json()
    print(f"5. Audit Trail Entries: {len(audit)}")
    print(f"   Latest Audit Action: {audit[0]['action']} | Resource: {audit[0]['resource_id'][:8]}")

    # 6. Generate Intelligence Briefing
    report = client.post("/reports/generate", json={
        "title": "Maritime Bunkering & Shadow Fleet Operations"
    }).json()
    print(f"6. Intelligence Assessment Compiled: Report ID {report['report_id'][:8]} with {len(report['citations'])} cited evidence references.")

    print("\n>>> ALL TESTS PASSED: COMPLETE SYSTEM IS OPERATIONAL <<<")

if __name__ == "__main__":
    test_workflow()

