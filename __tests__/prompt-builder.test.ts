import { buildPrompt } from "@/lib/prompt-builder";

describe("buildPrompt", () => {
  it("includes base style guide for all modes", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("Convert the sketch into a clean product UI mock concept");
    expect(result).toContain("mobile app screen design");
    expect(result).toContain("Modern, minimal");
  });

  it("includes mode-specific instruction for 1y", () => {
    const result = buildPrompt("1y", "");
    expect(result).toContain("1 Year");
    expect(result).toContain("near-term iteration, feasible improvements");
  });

  it("includes mode-specific instruction for 3y", () => {
    const result = buildPrompt("3y", "");
    expect(result).toContain("3 Years");
    expect(result).toContain("meaningful evolution, new capabilities");
  });

  it("includes mode-specific instruction for 5y", () => {
    const result = buildPrompt("5y", "");
    expect(result).toContain("5 Years");
    expect(result).toContain("visionary but coherent, next-gen experience");
  });

  it("includes user prompt when provided", () => {
    const result = buildPrompt("1y", "A fitness tracking app");
    expect(result).toContain("User description: A fitness tracking app");
  });

  it("trims user prompt", () => {
    const result = buildPrompt("1y", "  hello world  ");
    expect(result).toContain("User description: hello world");
  });

  it("omits user description line when prompt is empty", () => {
    const result = buildPrompt("1y", "");
    expect(result).not.toContain("User description");
  });

  it("omits user description line when prompt is whitespace only", () => {
    const result = buildPrompt("1y", "   ");
    expect(result).not.toContain("User description");
  });
});
