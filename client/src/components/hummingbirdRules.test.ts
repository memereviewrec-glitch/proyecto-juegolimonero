import { describe, expect, it } from "vitest";
import { resolveHummingbirdOutcome } from "./hummingbirdRules";

describe("hummingbird outcome thresholds", () => {
  it("makes friendship at 80 points or higher", () => {
    expect(resolveHummingbirdOutcome(80, false)).toBe("good");
    expect(resolveHummingbirdOutcome(100, true)).toBe("good");
  });

  it("ends badly as soon as the score falls below -80", () => {
    expect(resolveHummingbirdOutcome(-81, false)).toBe("bad");
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
