export type Mode = "1y" | "3y" | "5y";

export interface ModeConfig {
  label: string;
  description: string;
  years: number;
  /** Visual polish direction — controls style intensity, NOT content */
  styleGuide: string;
}

export const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  "1y": {
    label: "1 Year",
    description: "Near-term iteration with feasible improvements to your current app.",
    years: 1,
    styleGuide: [
      "STYLE: Clean, polished, production-ready.",
      "Render the sketch as a real app screen with clean lines, consistent spacing, and proper alignment.",
      "Use a simple, professional color palette. Subtle shadows, standard border radius, balanced whitespace.",
      "Typography should be clean and readable with clear size hierarchy.",
    ].join("\n"),
  },
  "3y": {
    label: "3 Years",
    description: "Meaningful evolution with new capabilities and smarter interactions.",
    years: 3,
    styleGuide: [
      "STYLE: Refined, premium, high-fidelity.",
      "Render the sketch with higher visual richness — more expressive colors, subtle gradients, layered depth.",
      "Apply slightly bolder typography, richer shadows, and more sophisticated visual treatments.",
      "The overall feel should be more polished and premium than a standard app, while still rendering exactly what was drawn.",
    ].join("\n"),
  },
  "5y": {
    label: "5 Years",
    description: "Visionary but coherent next-gen experience — reimagine what's possible.",
    years: 5,
    styleGuide: [
      "STYLE: Bold, striking, high-impact.",
      "Render the sketch with the most expressive visual treatment — vivid colors, strong contrasts, rich depth effects.",
      "Apply bold typography, pronounced visual layering, and a distinctive color palette.",
      "The overall feel should be visually striking and confident, while still rendering exactly what was drawn.",
    ].join("\n"),
  },
};

export function isValidMode(value: string): value is Mode {
  return value === "1y" || value === "3y" || value === "5y";
}

export interface RefineRequest {
  image: string; // base64 PNG (no data: prefix)
  prompt: string;
  mode: Mode;
  isRegion?: boolean;
}

export interface RefineResponse {
  image: string; // base64 PNG
  error?: string;
}

export interface GenerateRequest {
  prompt: string;
}

export interface GenerateResponse {
  image: string; // data:image/png;base64,...
  error?: string;
}
