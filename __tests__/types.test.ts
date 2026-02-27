import { isValidMode, MODE_CONFIGS } from "@/types";

describe("isValidMode", () => {
  it("returns true for valid modes", () => {
    expect(isValidMode("1y")).toBe(true);
    expect(isValidMode("3y")).toBe(true);
    expect(isValidMode("5y")).toBe(true);
  });

  it("returns false for invalid modes", () => {
    expect(isValidMode("2y")).toBe(false);
    expect(isValidMode("")).toBe(false);
    expect(isValidMode("10y")).toBe(false);
    expect(isValidMode("abc")).toBe(false);
  });
});

describe("MODE_CONFIGS", () => {
  it("has config for all three modes", () => {
    expect(MODE_CONFIGS["1y"]).toBeDefined();
    expect(MODE_CONFIGS["3y"]).toBeDefined();
    expect(MODE_CONFIGS["5y"]).toBeDefined();
  });

  it("each config has required fields", () => {
    for (const key of ["1y", "3y", "5y"] as const) {
      const config = MODE_CONFIGS[key];
      expect(config.label).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.styleGuide).toBeTruthy();
      expect(config.years).toBeGreaterThan(0);
    }
  });
});
