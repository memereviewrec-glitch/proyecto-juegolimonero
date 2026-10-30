import { describe, expect, it } from "vitest";
import { C_SHARP_MINOR_SCALE, clamp, dawnWalkableTop, resolveBranch } from "./gameRules";

describe("gameRules", () => {
  it("clamps values to the supplied interval", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("resolves a non-tied conversation score to its stronger branch", () => {
    expect(resolveBranch(2, 0)).toBe("A");
    expect(resolveBranch(0, 2)).toBe("B");
  });

  it("keeps the dawn walkable boundary within the authored terrain", () => {
    expect(dawnWalkableTop(0)).toBe(68);
    expect(dawnWalkableTop(100)).toBe(85);
    expect(dawnWalkableTop(50)).toBeGreaterThan(68);
    expect(dawnWalkableTop(50)).toBeLessThan(85);
  });

  it("contains the required C-sharp minor pitch classes", () => {
    expect([...C_SHARP_MINOR_SCALE]).toEqual(["Do#", "Re#", "Mi", "Fa#", "Sol#", "La", "Si"]);
  });
});
