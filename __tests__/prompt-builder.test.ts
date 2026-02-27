import { buildPrompt, buildRegionRefinePrompt, buildGeneratePrompt } from "@/lib/prompt-builder";

describe("buildPrompt", () => {
  it("includes workshop context", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("Future Sketch Workshop");
    expect(result).toContain("rough hand-drawn sketch");
  });

  it("includes preservation rules", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("LAYOUT: Keep every element in its approximate position");
    expect(result).toContain("TEXT: Reproduce all text/labels exactly as written");
  });

  it("includes mode-specific design direction for 1y", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("1 Year");
    expect(result).toContain("realistic, achievable next version");
    expect(result).toContain("current mainstream patterns");
  });

  it("includes mode-specific design direction for 3y", () => {
    const result = buildPrompt("3y", "");
    expect(result).toContain("3 Years");
    expect(result).toContain("significant evolution");
    expect(result).toContain("AI-enhanced UI elements");
  });

  it("includes mode-specific design direction for 5y", () => {
    const result = buildPrompt("5y", "");
    expect(result).toContain("5 Years");
    expect(result).toContain("bold, visionary reimagining");
    expect(result).toContain("spatial");
  });

  it("includes user prompt when provided", () => {
    const result = buildPrompt("1y", "A fitness tracking app");
    expect(result).toContain('"A fitness tracking app"');
    expect(result).toContain("APP CONTEXT FROM PARTICIPANT");
  });

  it("trims user prompt", () => {
    const result = buildPrompt("1y", "  hello world  ");
    expect(result).toContain('"hello world"');
  });

  it("omits user description section when prompt is empty", () => {
    const result = buildPrompt("1y", "");
    expect(result).not.toContain("APP CONTEXT FROM PARTICIPANT");
  });

  it("omits user description section when prompt is whitespace only", () => {
    const result = buildPrompt("1y", "   ");
    expect(result).not.toContain("APP CONTEXT FROM PARTICIPANT");
  });
});

describe("buildRegionRefinePrompt", () => {
  it("includes cropped section context", () => {
    const result = buildRegionRefinePrompt("1y", "");
    expect(result).toContain("CROPPED SECTION");
    expect(result).toContain("bigger design");
  });

  it("includes preservation rules", () => {
    const result = buildRegionRefinePrompt("3y", "");
    expect(result).toContain("LAYOUT: Keep every element in its approximate position");
  });

  it("includes mode context and design direction", () => {
    const result = buildRegionRefinePrompt("5y", "test app");
    expect(result).toContain("5 Years");
    expect(result).toContain("bold, visionary reimagining");
    expect(result).toContain("test app");
  });
});

describe("buildGeneratePrompt", () => {
  it("includes workshop context and generation instructions", () => {
    const result = buildGeneratePrompt("a chat icon");
    expect(result).toContain("Future Sketch Workshop");
    expect(result).toContain("GENERATE: a chat icon");
  });

  it("includes output requirements", () => {
    const result = buildGeneratePrompt("navigation bar");
    expect(result).toContain("OUTPUT REQUIREMENTS");
    expect(result).toContain("modern, professional, production-quality");
  });
});
