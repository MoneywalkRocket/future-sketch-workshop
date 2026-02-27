import { Mode, MODE_CONFIGS } from "@/types";

const BASE_STYLE_GUIDE = [
  "Convert the sketch into a clean product UI mock concept.",
  "Keep it as a mobile app screen design.",
  "Modern, minimal, readable typography, clear hierarchy.",
  "Preserve layout intent but improve alignment and visual polish.",
  "Do not add unrelated elements.",
].join(" ");

export function buildPrompt(mode: Mode, userPrompt: string): string {
  const modeConfig = MODE_CONFIGS[mode];
  const parts = [
    BASE_STYLE_GUIDE,
    `Timeline vision: ${modeConfig.label} from now — ${modeConfig.promptSuffix}.`,
  ];

  const trimmed = userPrompt.trim();
  if (trimmed) {
    parts.push(`User description: ${trimmed}`);
  }

  return parts.join("\n\n");
}
