import { Mode, MODE_CONFIGS } from "@/types";

// ─── CORE PRINCIPLE ───────────────────────────────────────────────
// The AI must render EXACTLY what the user drew. Nothing more,
// nothing less. No imagination, no additions, no reinterpretation.
// The sketch is the single source of truth.
// ──────────────────────────────────────────────────────────────────

const REFINE_PROMPT = [
  "Transform this hand-drawn sketch into a polished UI mockup.",
  "",
  "RULES:",
  "1. Render EXACTLY what is drawn — do not add, remove, or reinterpret any element.",
  "2. Every element in the sketch is intentional. A rectangle is a rectangle. A circle is a circle. A line of text is that exact text.",
  "3. Keep every element in its drawn position. Do not rearrange the layout.",
  "4. Keep relative sizes. Large stays large, small stays small.",
  "5. Reproduce all text/labels exactly as written. Do not translate, rephrase, or change wording.",
  "",
  "HOW TO POLISH:",
  "- Straighten hand-drawn lines into clean geometric shapes",
  "- Apply consistent spacing and alignment",
  "- Render text with proper typography (appropriate sizes, weights, line heights)",
  "- Add standard UI polish: border radius, subtle shadows, proper padding",
  "- Where the sketch shows small symbols or circles near text, render them as appropriate icons",
  "- Apply a cohesive color palette",
  "",
  "DO NOT:",
  "- Add elements that are not in the sketch (no extra buttons, icons, sections, decorations)",
  "- Add device frames, status bars, or navigation bars unless drawn in the sketch",
  "- Generate photographic or realistic imagery — output a clean UI mockup",
  "- Change the fundamental structure of what was drawn",
  "- Imagine or assume what the user 'meant to draw' — render what IS drawn",
].join("\n");

export function buildPrompt(mode: Mode, userPrompt: string): string {
  const config = MODE_CONFIGS[mode];
  const parts = [
    REFINE_PROMPT,
    "",
    config.styleGuide,
  ];

  const trimmed = userPrompt.trim();
  if (trimmed) {
    parts.push(
      "",
      `CONTEXT: "${trimmed}"`,
      "Use this only to choose appropriate colors and icon styles. Do NOT change what was drawn."
    );
  }

  return parts.join("\n");
}

export function buildRegionRefinePrompt(mode: Mode, userPrompt: string): string {
  const config = MODE_CONFIGS[mode];
  const parts = [
    "This image is a CROPPED SECTION of a larger sketch, not a full screen.",
    "Refine only what you see. Do not add anything around the edges.",
    "",
    REFINE_PROMPT,
    "",
    config.styleGuide,
  ];

  const trimmed = userPrompt.trim();
  if (trimmed) {
    parts.push(
      "",
      `CONTEXT: "${trimmed}"`,
      "Use this only to choose appropriate colors and icon styles."
    );
  }

  return parts.join("\n");
}

export function buildGeneratePrompt(userPrompt: string): string {
  return [
    "Generate exactly what is described below as a clean image asset.",
    "Output on a white or transparent background.",
    "Style: modern, professional, suitable for a UI design mockup.",
    "Do not add extra elements, decorations, or frames unless requested.",
    "",
    `GENERATE: ${userPrompt}`,
  ].join("\n");
}
