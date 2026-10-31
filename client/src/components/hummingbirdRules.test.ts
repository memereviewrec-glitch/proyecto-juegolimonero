import { describe, expect, it } from "vitest";
import { resolveHummingbirdOutcome } from "./hummingbirdRules";

describe("hummingbird outcome thresholds", () => {
  it("ends immediately in friendship only when the score reaches 100", () => {
    expect(resolveHummingbirdOutcome(100, false)).toBe("good");
    expect(resolveHummingbirdOutcome(99, false)).toBeNull();
    expect(resolveHummingbirdOutcome(80, false)).toBeNull();
  });

  it("decides a high score of 80 or more at the sixth answer", () => {
    expect(resolveHummingbirdOutcome(80, true)).toBe("good");
    expect(resolveHummingbirdOutcome(99, true)).toBe("good");
  });

  it("keeps a score below -80 in the conversation until the sixth answer", () => {
    expect(resolveHummingbirdOutcome(-81, false)).toBeNull();
    expect(resolveHummingbirdOutcome(-90, false)).toBeNull();
    expect(resolveHummingbirdOutcome(-81, true)).toBe("bad");
    expect(resolveHummingbirdOutcome(-90, true)).toBe("bad");
  });

  it("keeps scores from -80 up to, but not including, 80 in the neutral band", () => {
    expect(resolveHummingbirdOutcome(-80, false)).toBeNull();
    expect(resolveHummingbirdOutcome(0, false)).toBeNull();
    expect(resolveHummingbirdOutcome(79, false)).toBeNull();
    expect(resolveHummingbirdOutcome(-80, true)).toBe("neutral");
    expect(resolveHummingbirdOutcome(79, true)).toBe("neutral");
  });
});
