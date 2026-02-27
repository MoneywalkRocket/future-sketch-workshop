import { NextRequest, NextResponse } from "next/server";
import { isValidMode, RefineRequest } from "@/types";
import { buildPrompt } from "@/lib/prompt-builder";
import { checkRateLimit } from "@/lib/rate-limit";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Max ~5MB base64 payload
const MAX_IMAGE_SIZE = 7_000_000;

export async function POST(req: NextRequest) {
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

  // Validate API key
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured");
    return NextResponse.json(
      { error: "AI service not configured. Please set GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  // Parse and validate body
  let body: RefineRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { image, prompt, mode } = body;

  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "Missing or invalid image" }, { status: 400 });
  }
  if (image.length > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Image too large (max ~5MB)" }, { status: 400 });
  }
  if (!isValidMode(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  if (prompt && typeof prompt !== "string") {
    return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
  }
  if (prompt && prompt.length > 500) {
    return NextResponse.json({ error: "Prompt too long (max 500 chars)" }, { status: 400 });
  }

  const fullPrompt = buildPrompt(mode, prompt || "");

  try {
    // Call Gemini API (Gemini 2.0 Flash with image generation)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`;

    const geminiBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: image,
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return NextResponse.json(
        { error: `AI service returned an error (${geminiRes.status}). Please try again.` },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();

    // Extract image from response
    const candidates = geminiData.candidates;
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: "AI did not return any results. Try a different drawing or prompt." },
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
        { error: "AI did not return an image. Try adding more detail to your sketch." },
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
    console.error("Gemini call failed:", err);
    return NextResponse.json(
      { error: "Failed to connect to AI service. Please check your connection and try again." },
      { status: 500 }
    );
  }
}
