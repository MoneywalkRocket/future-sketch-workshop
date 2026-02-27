import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows the first request", () => {
    const result = checkRateLimit("test-ip-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it("tracks requests per IP", () => {
    const ip = "test-ip-counter-" + Date.now();
    checkRateLimit(ip); // 1
    checkRateLimit(ip); // 2
    const result = checkRateLimit(ip); // 3
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(27);
  });

  it("blocks after exceeding limit", () => {
    const ip = "test-ip-limit-" + Date.now();
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip);
    }
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("different IPs have independent limits", () => {
    const ip1 = "test-ip-a-" + Date.now();
    const ip2 = "test-ip-b-" + Date.now();
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip1);
    }
    const result = checkRateLimit(ip2);
    expect(result.allowed).toBe(true);
  });
});
