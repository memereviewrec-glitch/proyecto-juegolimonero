import { describe, expect, it } from "vitest";
import { evaluateRhythmPick, getFastestToSlowestOrder, getNextRhythmPatternIndex, RHYTHM_COLORS, RHYTHM_PATTERNS } from "./nueveSentidosRules";

describe("reglas de ritmo de Nueve Sentidos", () => {
  it("cada patrón contiene cuatro pulsos diferentes y una ordenación completa", () => {
    RHYTHM_PATTERNS.forEach((pattern, index) => {
      expect(new Set(Object.values(pattern)).size).toBe(RHYTHM_COLORS.length);
      expect(getFastestToSlowestOrder(index)).toHaveLength(RHYTHM_COLORS.length);
      expect(new Set(getFastestToSlowestOrder(index))).toEqual(new Set(RHYTHM_COLORS));
    });
  });

  it("cambiar de patrón altera el pulso de todos los colores", () => {
    RHYTHM_PATTERNS.forEach((pattern, index) => {
      const next = RHYTHM_PATTERNS[getNextRhythmPatternIndex(index)];
      RHYTHM_COLORS.forEach(color => expect(next[color]).not.toBe(pattern[color]));
    });
  });

  it("avanza solo con la estrella correcta, en orden de más rápida a más lenta", () => {
    const order = getFastestToSlowestOrder(0);
    expect(evaluateRhythmPick(0, 0, order[0])).toBe("correct");
    expect(evaluateRhythmPick(0, 1, order[1])).toBe("correct");
    expect(evaluateRhythmPick(0, 2, order[2])).toBe("correct");
    expect(evaluateRhythmPick(0, 3, order[3])).toBe("complete");
    expect(evaluateRhythmPick(0, 0, order[1])).toBe("wrong");
  });
});
