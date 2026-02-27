import { buildPrompt, buildRegionRefinePrompt, buildGeneratePrompt } from "@/lib/prompt-builder";

describe("buildPrompt", () => {
  it("includes core refine rules", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("Render EXACTLY what is drawn");
    expect(result).toContain("do not add, remove, or reinterpret");
  });

  it("includes polish instructions", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("Straighten hand-drawn lines");
    expect(result).toContain("consistent spacing and alignment");
  });

  it("includes anti-patterns", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("DO NOT:");
    expect(result).toContain("Add elements that are not in the sketch");
  });

  it("includes style guide for 1y", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("Clean, polished, production-ready");
  });

  it("includes style guide for 3y", () => {
    const result = buildPrompt("3y", "");
    expect(result).toContain("Refined, premium, high-fidelity");
  });

  it("includes style guide for 5y", () => {
    const result = buildPrompt("5y", "");
    expect(result).toContain("Bold, striking, high-impact");
  });

  it("includes user context when provided", () => {
    const result = buildPrompt("1y", "A fitness tracking app");
    expect(result).toContain('"A fitness tracking app"');
    expect(result).toContain("Do NOT change what was drawn");
  });

  it("trims user prompt", () => {
    const result = buildPrompt("1y", "  hello world  ");
    expect(result).toContain('"hello world"');
  });

  it("omits context section when prompt is empty", () => {
    const result = buildPrompt("1y", "");
    expect(result).not.toContain("CONTEXT:");
  });

  it("omits context section when prompt is whitespace only", () => {
    const result = buildPrompt("1y", "   ");
    expect(result).not.toContain("CONTEXT:");
  });
});

describe("buildRegionRefinePrompt", () => {
  it("includes cropped section notice", () => {
    const result = buildRegionRefinePrompt("1y", "");
    expect(result).toContain("CROPPED SECTION");
    expect(result).toContain("Do not add anything around the edges");
  });

  it("includes core refine rules", () => {
    const result = buildRegionRefinePrompt("3y", "");
    expect(result).toContain("Render EXACTLY what is drawn");
  });

  it("includes style guide and user context", () => {
    const result = buildRegionRefinePrompt("5y", "test app");
    expect(result).toContain("Bold, striking, high-impact");
    expect(result).toContain("test app");
  });
});

describe("buildGeneratePrompt", () => {
  it("includes generation instruction", () => {
    const result = buildGeneratePrompt("a chat icon");
    expect(result).toContain("Generate exactly what is described");
    expect(result).toContain("GENERATE: a chat icon");
  });

  it("specifies no extra elements", () => {
    const result = buildGeneratePrompt("navigation bar");
    expect(result).toContain("Do not add extra elements");
  });
});
