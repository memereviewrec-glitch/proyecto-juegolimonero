import { describe, expect, it } from "vitest";
import { C_SHARP_MINOR_SCALE, clamp, dawnWalkableTop, isValidCSharpMinorChord, resolveBranch } from "./gameRules";

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

  it("recognizes a valid C-sharp minor chord and rejects incomplete or dissonant selections", () => {
    expect(isValidCSharpMinorChord(["Do#", "Mi", "Sol#"])).toBe(true);
    expect(isValidCSharpMinorChord(["Do#"])).toBe(false);
    expect(isValidCSharpMinorChord(["Mi", "Sol#"])).toBe(false);
    expect(isValidCSharpMinorChord(["Do#", "Fa"])).toBe(false);
    expect(isValidCSharpMinorChord(["Do#", "Do#"])).toBe(false);
  });

  it("contains the required C-sharp minor pitch classes", () => {
    expect([...C_SHARP_MINOR_SCALE]).toEqual(["Do#", "Re#", "Mi", "Fa#", "Sol#", "La", "Si"]);
  });
});
