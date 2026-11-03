import re
from typing import Tuple, List, Dict, Any
from sarvamai import SarvamAI
from app.core.config import settings

INDIC_SCRIPTS = {
    "hi": (0x0900, 0x097F), # Devanagari (Hindi, Marathi)
    "bn": (0x0980, 0x09FF), # Bengali
    "pa": (0x0A00, 0x0A7F), # Gurmukhi (Punjabi)
    "gu": (0x0A80, 0x0AFF), # Gujarati
    "or": (0x0B00, 0x0B7F), # Oriya
    "ta": (0x0B80, 0x0BFF), # Tamil
    "te": (0x0C00, 0x0C7F), # Telugu
    "kn": (0x0C80, 0x0CFF), # Kannada
    "ml": (0x0D00, 0x0D7F), # Malayalam
}

class MultilingualService:
    def __init__(self):
        self.sarvam_client = None
        if settings.SARVAM_API_KEY:
            try:
                self.sarvam_client = SarvamAI(api_subscription_key=settings.SARVAM_API_KEY)
            except Exception:
                pass

    def detect_language(self, text: str) -> str:
        """Accurately identify script and language."""
        if not text:
            return "en"
            
        counts = {lang: 0 for lang in INDIC_SCRIPTS}
        total_indic = 0
        
        for char in text:
            cp = ord(char)
            for lang, (start, end) in INDIC_SCRIPTS.items():
                if start <= cp <= end:
                    counts[lang] += 1
                    total_indic += 1
                    break
                    
        if total_indic > 5:
            # Return detected Indic language with maximum character frequency
            return max(counts, key=counts.get)
            
        return "en"

    def translate_to_english(self, text: str, source_lang: str) -> Tuple[str, float]:
        """
        Translate non-English text to English while preserving original content.
        Uses Sarvam AI translation or LLM completion if available.
        """
        if source_lang == "en" or not text.strip():
            return text, 1.0

        if self.sarvam_client:
            try:
                src_code = f"{source_lang}-IN" if len(source_lang) == 2 else "auto"
                res = self.sarvam_client.text.translate(
                    input=text,
                    source_language_code=src_code,
                    target_language_code="en-IN"
                )
                if res and getattr(res, "translated_text", None):
                    return res.translated_text.strip(), 0.98
            except Exception:
                pass

            try:
                # Use Sarvam LLM for high-accuracy translation
                response = self.sarvam_client.chat.completions(
                    model="sarvam-105b-conversations",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a professional intelligence linguist. "
                                "Translate the provided text directly into accurate, clear English. "
                                "Maintain all named entities, acronyms, dates, and technical terminology exactly. "
                                "Output ONLY the English translation without preamble or commentary."
                            )
                        },
                        {"role": "user", "content": text}
                    ]
                )
                translated = response.choices[0].message.content.strip()
                return translated, 0.95
            except Exception:
                pass
                
        # Fallback: if offline, return text with note
        return f"[Translation to EN pending - Original {source_lang.upper()}]: {text}", 0.70

    def chunk_document(self, text: str, max_chunk_chars: int = 1200) -> List[Dict[str, Any]]:
        """Split text into logically bounded paragraphs while preserving character offsets."""
        paragraphs = text.split("\n\n")
        chunks = []
        current_offset = 0
        
        chunk_idx = 0
        for p in paragraphs:
            p_clean = p.strip()
            if not p_clean:
                current_offset += len(p) + 2
                continue
                
            start = text.find(p_clean, current_offset)
            if start == -1:
                start = current_offset
            end = start + len(p_clean)
            current_offset = end
            
            chunks.append({
                "chunk_index": chunk_idx,
                "raw_text": p_clean,
                "char_offset_start": start,
                "char_offset_end": end,
            })
            chunk_idx += 1
            
        return chunks

multilingual_service = MultilingualService()

