import { describe, expect, it } from "vitest";
import { getRiverChoiceConsequence } from "./riverChoiceRules";

describe("River choice consequences", () => {
  it("gives each peaceful answer a distinct reply and ending", () => {
    const consequences = [0, 1, 2].map(index => getRiverChoiceConsequence("pacifico", index));
    expect(consequences.every(Boolean)).toBe(true);
    expect(new Set(consequences.map(item => item?.reply)).size).toBe(3);
    expect(new Set(consequences.map(item => item?.ending)).size).toBe(3);
  });

  it("gives each drastic answer a distinct reply and ending", () => {
    const consequences = [0, 1, 2].map(index => getRiverChoiceConsequence("drastico", index));
    expect(consequences.every(Boolean)).toBe(true);
    expect(new Set(consequences.map(item => item?.reply)).size).toBe(3);
    expect(new Set(consequences.map(item => item?.ending)).size).toBe(3);
  });

  it("returns no consequence for an invalid choice", () => {
    expect(getRiverChoiceConsequence("pacifico", -1)).toBeNull();
    expect(getRiverChoiceConsequence("drastico", 3)).toBeNull();
  });
});
