import { Mode, MODE_CONFIGS } from "@/types";

// ─── CONTEXT ──────────────────────────────────────────────────────
// This project is "Future Sketch Workshop" — a workshop tool where
// participants imagine what their app/product will look like in
// 1, 3, or 5 years. They draw rough sketches by hand, then AI
// transforms those sketches into polished, realistic UI mockups
// that bring their vision to life.
// ──────────────────────────────────────────────────────────────────

const WORKSHOP_CONTEXT = [
  "You are the AI design engine for 'Future Sketch Workshop' — a creative workshop where product teams imagine and visualize the future of their app.",
  "A participant has drawn a rough sketch of what they envision their app looking like in the future.",
  "Your job is to transform this rough hand-drawn sketch into a polished, realistic UI mockup that brings their vision to life.",
  "Treat every element in the sketch as an intentional design decision — the participant drew it there for a reason.",
].join("\n");

const PRESERVATION_RULES = [
  "PRESERVATION RULES (non-negotiable):",
  "1. LAYOUT: Keep every element in its approximate position. If something is at the top, it stays at the top. If elements are side-by-side, they stay side-by-side.",
  "2. HIERARCHY: Maintain relative sizes. Large elements stay dominant, small elements stay secondary.",
  "3. TEXT: Reproduce all text/labels exactly as written. Do not translate, rephrase, or omit any text.",
  "4. COUNT: Keep the same number of elements. Don't add buttons, cards, or sections that aren't in the sketch. Don't remove any.",
  "5. INTENT: If the sketch shows a list, make it a list. If it shows a graph, make it a graph. If it shows a map, make it a map. Respect what each element represents.",
].join("\n");

const TRANSFORMATION_RULES = [
  "TRANSFORMATION RULES (how to polish):",
  "- Convert rough hand-drawn shapes into clean, precise geometric forms",
  "- Apply consistent 8px-grid alignment and professional spacing",
  "- Replace scribbled text with properly rendered typography (appropriate font sizes, weights, line heights)",
  "- Turn rough circles/squares into proper buttons, icons, avatars, or UI components based on context",
  "- Add realistic UI details: proper border radius, subtle shadows, appropriate padding, divider lines",
  "- Apply a cohesive color palette that fits the app's apparent purpose",
  "- Where the sketch implies icons (small symbols/circles), replace with appropriate, recognizable icons",
  "- Make it look like a real, functioning app screen — not a wireframe, not a sketch, but a finished product",
].join("\n");

const ANTI_PATTERNS = [
  "NEVER DO THESE:",
  "- Do NOT reinterpret the design as something completely different",
  "- Do NOT add a phone frame, device bezel, status bar, or home indicator unless the sketch includes one",
  "- Do NOT add decorative stock photos, marketing copy, or elements not implied by the sketch",
  "- Do NOT change the fundamental layout structure (vertical ↔ horizontal, single column ↔ multi-column)",
  "- Do NOT generate photographic/realistic imagery — output should be a clean UI mockup",
  "- Do NOT ignore small details in the sketch — even a tiny element is intentional",
].join("\n");

export function buildPrompt(mode: Mode, userPrompt: string): string {
  const config = MODE_CONFIGS[mode];
  const parts = [
    WORKSHOP_CONTEXT,
    "",
    `TIMELINE: The participant is imagining their app ${config.label} from now.`,
    "",
    config.designDirection,
    "",
    PRESERVATION_RULES,
    "",
    TRANSFORMATION_RULES,
    "",
    ANTI_PATTERNS,
  ];

  const trimmed = userPrompt.trim();
  if (trimmed) {
    parts.push(
      "",
      "APP CONTEXT FROM PARTICIPANT:",
      `"${trimmed}"`,
      "Use this to inform your design decisions — choose appropriate colors, iconography, terminology, and visual tone that match this app's domain. But do NOT alter the layout structure."
    );
  }

  return parts.join("\n");
}

export function buildRegionRefinePrompt(mode: Mode, userPrompt: string): string {
  const config = MODE_CONFIGS[mode];
  const parts = [
    WORKSHOP_CONTEXT,
    "",
    "IMPORTANT: This image is a CROPPED SECTION of a larger sketch — not a full screen.",
    "You are refining only this specific area. Every element visible is intentional and part of a bigger design.",
    "Do NOT add elements around the edges to 'complete' the screen. Do NOT add padding or borders.",
    "Refine exactly what you see, maintaining every element's position within this frame.",
    "",
    `TIMELINE: The participant is imagining their app ${config.label} from now.`,
    "",
    config.designDirection,
    "",
    PRESERVATION_RULES,
    "",
    TRANSFORMATION_RULES,
    "",
    ANTI_PATTERNS,
  ];

  const trimmed = userPrompt.trim();
  if (trimmed) {
    parts.push(
      "",
      "APP CONTEXT FROM PARTICIPANT:",
      `"${trimmed}"`,
      "Use this to inform color, icon, and style choices for this section."
    );
  }

  return parts.join("\n");
}

export function buildGeneratePrompt(userPrompt: string): string {
  return [
    "You are the AI design engine for 'Future Sketch Workshop' — a creative workshop where product teams imagine the future of their app.",
    "A participant needs a visual asset to add to their sketch board. Generate exactly what they describe.",
    "",
    "OUTPUT REQUIREMENTS:",
    "- Generate a clean, high-quality image suitable for placing on a UI design canvas",
    "- Style: modern, professional, production-quality — like assets from Figma or Sketch",
    "- White or transparent background so the asset can be placed over any canvas",
    "- If the request is for a UI component (button, card, navigation bar, etc.), make it look like a real, polished UI element",
    "- If the request is for an icon or illustration, make it clean and vector-like",
    "- If the request is for a screen or layout, make it look like a realistic app screen mockup",
    "- Do NOT add device frames or browser chrome unless specifically requested",
    "- Do NOT add watermarks, labels, or annotations",
    "",
    `GENERATE: ${userPrompt}`,
  ].join("\n");
}
