import json
import re
from typing import List, Dict, Any, Tuple
from sarvamai import SarvamAI
from backend.app.core.config import settings

class EntityExtractor:
    def __init__(self):
        self.sarvam_client = None
        if settings.SARVAM_API_KEY:
            try:
                self.sarvam_client = SarvamAI(api_subscription_key=settings.SARVAM_API_KEY)
            except Exception:
                pass

    def extract_with_sarvam(self, text: str) -> Dict[str, Any]:
        """Call Sarvam AI to extract structured intelligence entities, events, relationships, and evidence."""
        if not self.sarvam_client:
            return self.extract_heuristic(text)
            
        system_prompt = (
            "You are an OSINT Intelligence Analyst. Analyze the text and extract named entities, "
            "relationships, and events with exact supporting quotes.\n"
            "Return ONLY valid JSON matching this schema:\n"
            "{\n"
            '  "entities": [{"name": "string", "type": "PERSON|ORGANIZATION|LOCATION|EVENT|INFRASTRUCTURE|DATE", "confidence": float}],\n'
            '  "relationships": [{"source": "string", "target": "string", "relation": "string", "quote": "exact quote from text", "confidence": float}]\n'
            "}\n"
            "Rules:\n"
            "- Only extract entities explicitly mentioned.\n"
            "- Do not guess or extrapolate criminal intent or unverified accusations.\n"
            "- The quote MUST be an exact substring from the text."
        )

        try:
            response = self.sarvam_client.chat.completions(
                model="sarvam-105b-conversations",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text[:3500]}
                ],
                temperature=0.1
            )
            raw_reply = response.choices[0].message.content.strip()
            
            # Clean markdown codeblocks if returned
            if "```json" in raw_reply:
                raw_reply = raw_reply.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_reply:
                raw_reply = raw_reply.split("```")[1].split("```")[0].strip()
                
            parsed = json.loads(raw_reply)
            return self._enrich_offsets(text, parsed)
        except Exception:
            return self.extract_heuristic(text)

    def extract_heuristic(self, text: str) -> Dict[str, Any]:
        """
        Fast deterministic heuristic extraction for entities, locations, and relationships
        with verifiable character spans.
        """
        entities = []
        relationships = []
        
        # Regex patterns for common OSINT entities
        org_pattern = r'\b([A-Z][a-zA-Z0-9]+(?:\s+(?:Corp|Corporation|Inc|Holdings|Ltd|Logistics|Maritime|Bank|Group|Agency|Authority|Minist(?:ry|ère)|Force|Fleet|Port|Customs|Foundation))+)\b'
        location_pattern = r'\b(Mumbai|New Delhi|Colombo|Singapore|Dubai|Rotterdam|Djibouti|Chabahar|Gwadar|Hong Kong|London|Bosphorus|Malacca Strait|Suez Canal|Bab el-Mandeb|Aden|Persian Gulf|Arabian Sea|Indian Ocean)\b'
        vessel_pattern = r'\b(MT\s+[A-Z][a-zA-Z0-9\s]+|MV\s+[A-Z][a-zA-Z0-9\s]+|Vessel\s+[A-Z][a-zA-Z0-9]+)\b'
        date_pattern = r'\b(?:\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}-\d{2}-\d{2})\b'
        
        seen_names = set()

        for match in re.finditer(org_pattern, text):
            name = match.group(1).strip()
            if name not in seen_names:
                seen_names.add(name)
                entities.append({
                    "name": name,
                    "type": "ORGANIZATION",
                    "confidence": 0.90,
                    "char_start": match.start(),
                    "char_end": match.end()
                })

        for match in re.finditer(location_pattern, text, re.IGNORECASE):
            name = match.group(1).strip()
            if name not in seen_names:
                seen_names.add(name)
                entities.append({
                    "name": name,
                    "type": "LOCATION",
                    "confidence": 0.95,
                    "char_start": match.start(),
                    "char_end": match.end()
                })

        for match in re.finditer(vessel_pattern, text):
            name = match.group(1).strip()
            if name not in seen_names:
                seen_names.add(name)
                entities.append({
                    "name": name,
                    "type": "INFRASTRUCTURE",
                    "confidence": 0.92,
                    "char_start": match.start(),
                    "char_end": match.end()
                })

        for match in re.finditer(date_pattern, text):
            name = match.group(0).strip()
            if name not in seen_names:
                seen_names.add(name)
                entities.append({
                    "name": name,
                    "type": "DATE",
                    "confidence": 0.98,
                    "char_start": match.start(),
                    "char_end": match.end()
                })

        # Relational inference between nearby entities in same sentence
        sentences = re.split(r'(?<=[.!?])\s+', text)
        for s in sentences:
            s_clean = s.strip()
            present_entities = [e for e in entities if e["name"] in s_clean]
            if len(present_entities) >= 2:
                for i in range(len(present_entities) - 1):
                    e1 = present_entities[i]
                    e2 = present_entities[i+1]
                    
                    rel = "MENTIONED_WITH"
                    s_lower = s_clean.lower()
                    if "docked at" in s_lower or "berthed at" in s_lower or "arrived in" in s_lower:
                        rel = "DOCKED_AT"
                    elif "owned by" in s_lower or "operated by" in s_lower:
                        rel = "OPERATED_BY"
                    elif "transferred cargo" in s_lower or "sts transfer" in s_lower:
                        rel = "CARGO_TRANSFER"
                    elif "registered in" in s_lower:
                        rel = "REGISTERED_IN"
                    elif "investigated by" in s_lower:
                        rel = "INVESTIGATED_BY"

                    relationships.append({
                        "source": e1["name"],
                        "target": e2["name"],
                        "relation": rel,
                        "quote": s_clean,
                        "confidence": 0.85
                    })

        return {"entities": entities, "relationships": relationships}

    def _enrich_offsets(self, text: str, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure character start/end offsets and quote locations exist."""
        enriched_entities = []
        for e in parsed.get("entities", []):
            name = e.get("name", "")
            start = text.find(name)
            end = start + len(name) if start != -1 else 0
            enriched_entities.append({
                "name": name,
                "type": e.get("type", "ORGANIZATION"),
                "confidence": e.get("confidence", 0.9),
                "char_start": max(0, start),
                "char_end": max(0, end),
            })

        enriched_rels = []
        for r in parsed.get("relationships", []):
            quote = r.get("quote", "")
            start = text.find(quote) if quote else 0
            end = start + len(quote) if start != -1 and quote else 0
            enriched_rels.append({
                "source": r.get("source", ""),
                "target": r.get("target", ""),
                "relation": r.get("relation", "RELATED_TO"),
                "quote": quote or text[:120],
                "char_start": max(0, start),
                "char_end": max(0, end),
                "confidence": r.get("confidence", 0.85),
            })

        return {"entities": enriched_entities, "relationships": enriched_rels}

entity_extractor = EntityExtractor()

