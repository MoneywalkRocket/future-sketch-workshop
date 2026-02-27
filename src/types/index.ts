export type Mode = "1y" | "3y" | "5y";

export interface ModeConfig {
  label: string;
  description: string;
  promptSuffix: string;
  years: number;
  /** Detailed design direction for AI refine prompts */
  designDirection: string;
}

export const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  "1y": {
    label: "1 Year",
    description: "Near-term iteration with feasible improvements to your current app.",
    promptSuffix: "near-term iteration, feasible improvements",
    years: 1,
    designDirection: [
      "This is 1 YEAR into the future — a realistic, achievable next version.",
      "Visual style: Clean, modern, and polished — like a well-executed redesign shipping next quarter.",
      "UI patterns: Use current mainstream patterns (bottom tab bars, card layouts, standard navigation, familiar gestures).",
      "Typography: Refined hierarchy with clear headings, readable body text, proper line heights.",
      "Colors: A cohesive, professional palette. If the sketch implies a color scheme, refine it. Otherwise, use a clean modern palette (think iOS/Material Design quality).",
      "Polish level: The output should look like a real app screenshot — the kind you'd see in an App Store listing or a Dribbble shot.",
      "Improvements to show: Better spacing, cleaner alignment, subtle shadows/elevation, proper iconography, readable text.",
      "Do NOT add futuristic or experimental UI elements. Keep everything grounded in today's design standards.",
    ].join("\n"),
  },
  "3y": {
    label: "3 Years",
    description: "Meaningful evolution with new capabilities and smarter interactions.",
    promptSuffix: "meaningful evolution, new capabilities",
    years: 3,
    designDirection: [
      "This is 3 YEARS into the future — a significant evolution that feels like a major version upgrade.",
      "Visual style: Forward-looking but still usable — like a concept from a top design agency showing 'what's next'.",
      "UI patterns: Introduce smart, AI-enhanced UI elements where appropriate (contextual suggestions, predictive actions, adaptive layouts). Conversational UI elements, inline assistants, or smart cards are welcome if they fit the sketch's intent.",
      "Typography: More expressive typography with variable weights, dynamic type scales.",
      "Colors: A more sophisticated, trend-forward palette. Consider subtle gradients, glassmorphism, or layered depth effects where they enhance the design.",
      "Polish level: This should feel like a premium product concept — something that would wow stakeholders in a product strategy presentation.",
      "Improvements to show: Smarter information display, contextual features, richer interactions implied through visual design (micro-interaction hints, animation-ready layouts).",
      "Show evolution: The UI should clearly feel MORE capable and intelligent than today's apps, while still being intuitive.",
    ].join("\n"),
  },
  "5y": {
    label: "5 Years",
    description: "Visionary but coherent next-gen experience — reimagine what's possible.",
    promptSuffix: "visionary but coherent, next-gen experience",
    years: 5,
    designDirection: [
      "This is 5 YEARS into the future — a bold, visionary reimagining that pushes boundaries while staying coherent.",
      "Visual style: Next-generation design language. Think spatial design, ambient interfaces, or entirely new interaction paradigms. This should feel like looking at a product from the future.",
      "UI patterns: Go beyond conventional mobile screens if the sketch implies it. Consider spatial/3D layouts, augmented reality elements, floating UI panels, voice/gesture interface hints, hyper-personalized adaptive layouts, or ambient computing concepts.",
      "Typography: Futuristic yet legible — clean sans-serif, possibly with dynamic or responsive type that implies intelligence.",
      "Colors: Bold and distinctive. Deep, rich color schemes or ethereal, light-filled palettes that feel ahead of their time. Subtle glow effects, depth layers, or holographic hints are welcome where appropriate.",
      "Polish level: This should look like a concept film frame or a high-end design fiction piece — the kind of future-vision that inspires teams and gets people excited.",
      "Improvements to show: Radically smarter features, seamless cross-reality experiences, UI that anticipates user needs, information presented in entirely new ways.",
      "Be visionary but coherent: Even futuristic designs need clear visual hierarchy, readable text, and logical flow. Don't sacrifice usability for spectacle.",
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
