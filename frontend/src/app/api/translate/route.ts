import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguageCode = "en-IN", sourceLanguageCode = "auto" } =
      await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey =
      process.env.SARVAM_API_KEY ||
      process.env.SARVAM_API_KEY1 ||
      process.env.SARVAM_API_KEY2 ||
      "";

    // If Sarvam API key is configured, call Sarvam AI translate endpoint
    if (apiKey) {
      // Urdu and certain minority languages require model: "sarvam-translate:v1"
      const payload: Record<string, any> = {
        input: text.trim(),
        source_language_code: sourceLanguageCode || "auto",
        target_language_code: targetLanguageCode,
      };

      if (
        [
          "ur-IN",
          "as-IN",
          "brx-IN",
          "doi-IN",
          "kok-IN",
          "ks-IN",
          "mai-IN",
          "mni-IN",
          "ne-IN",
          "sa-IN",
          "sat-IN",
          "sd-IN",
        ].includes(targetLanguageCode)
      ) {
        payload.model = "sarvam-translate:v1";
      }

      const res = await fetch("https://api.sarvam.ai/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          translated_text: data.translated_text,
          detected_source_language: data.source_language_code || sourceLanguageCode,
          target_language_code: targetLanguageCode,
          status: "SUCCESS",
        });
      } else {
        const errText = await res.text();
        console.warn("Sarvam AI translate API error:", res.status, errText);
      }
    }

    // Fallback if offline or API key exhausted:
    return NextResponse.json({
      translated_text: text,
      detected_source_language: sourceLanguageCode,
      target_language_code: targetLanguageCode,
      status: "FALLBACK",
    });
  } catch (err: any) {
    console.error("Translation route failed:", err);
    return NextResponse.json(
      { error: err.message || "Translation failed" },
      { status: 500 }
    );
  }
}
