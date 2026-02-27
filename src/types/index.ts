export type Mode = "1y" | "3y" | "5y";

export interface ModeConfig {
  label: string;
  description: string;
  promptSuffix: string;
  years: number;
}

export const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  "1y": {
    label: "1 Year",
    description: "Near-term iteration with feasible improvements to your current app.",
    promptSuffix: "near-term iteration, feasible improvements",
    years: 1,
  },
  "3y": {
    label: "3 Years",
    description: "Meaningful evolution with new capabilities and smarter interactions.",
    promptSuffix: "meaningful evolution, new capabilities",
    years: 3,
  },
  "5y": {
    label: "5 Years",
    description: "Visionary but coherent next-gen experience — reimagine what's possible.",
    promptSuffix: "visionary but coherent, next-gen experience",
    years: 5,
  },
};

export function isValidMode(value: string): value is Mode {
  return value === "1y" || value === "3y" || value === "5y";
}

export interface RefineRequest {
  image: string; // base64 PNG (no data: prefix)
  prompt: string;
  mode: Mode;
}

export interface RefineResponse {
  image: string; // base64 PNG
  error?: string;
}
