import { NextRequest, NextResponse } from "next/server";
import { buildGeneratePrompt } from "@/lib/prompt-builder";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a few minutes and try again." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  }

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured");
    return NextResponse.json(
      { error: "AI service not configured. Please set GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt } = body;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
  }
  if (prompt.length > 500) {
    return NextResponse.json({ error: "Prompt too long (max 500 chars)" }, { status: 400 });
  }

  const fullPrompt = buildGeneratePrompt(prompt);

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`;

    const geminiBody = {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini Generate API error:", geminiRes.status, errText);

      if (geminiRes.status === 429) {
        return NextResponse.json(
          { error: "AI rate limit exceeded. Please wait 1-2 minutes and try again." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `AI service returned an error (${geminiRes.status}). Please try again.` },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();

    const candidates = geminiData.candidates;
    if (!candidates || candidates.length === 0) {
      console.error("Gemini Generate: no candidates. Response:", JSON.stringify(geminiData).slice(0, 500));
      return NextResponse.json(
        { error: "AI did not return any results. Try a different prompt." },
        { status: 502 }
      );
    }

    const parts = candidates[0].content?.parts || [];
    let outputImage: string | null = null;

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        outputImage = part.inlineData.data;
        break;
      }
    }

    if (!outputImage) {
      return NextResponse.json(
        { error: "AI did not return an image. Try a more descriptive prompt." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { image: `data:image/png;base64,${outputImage}` },
      {
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  } catch (err) {
    console.error("Gemini Generate call failed:", err);
    return NextResponse.json(
      { error: "Failed to connect to AI service. Please check your connection and try again." },
      { status: 500 }
    );
  }
}
