import { describe, expect, it } from "vitest";
import { applyRhythmPick, evaluateRhythmPick, getSlowestToFastestOrder, getNextRhythmPatternIndex, NOTE_DURATIONS_AT_60_BPM, RHYTHM_COLORS, RHYTHM_PATTERNS } from "./nueveSentidosRules";

describe("reglas de ritmo de Nueve Sentidos", () => {
  it("cada patrón contiene cuatro pulsos diferentes y una ordenación completa", () => {
    const noteDurations = new Set(Object.values(NOTE_DURATIONS_AT_60_BPM));
    RHYTHM_PATTERNS.forEach((pattern, index) => {
      expect(new Set(Object.values(pattern))).toEqual(noteDurations);
      expect(getSlowestToFastestOrder(index)).toHaveLength(RHYTHM_COLORS.length);
      expect(new Set(getSlowestToFastestOrder(index))).toEqual(new Set(RHYTHM_COLORS));
    });
  });

  it("ordena cada patrón de la más lenta a la más rápida", () => {
    RHYTHM_PATTERNS.forEach((pattern, index) => {
      const orderedDurations = getSlowestToFastestOrder(index).map(color => pattern[color]);
      expect(orderedDurations).toEqual([4000, 2000, 1000, 500]);
    });
    expect(getSlowestToFastestOrder(0)).toEqual(["red", "green", "blue", "yellow"]);
  });

  it("usa una redonda, blanca, negra y corchea exactas a 60 BPM y rota sus colores", () => {
    expect(NOTE_DURATIONS_AT_60_BPM).toEqual({ redonda: 4000, blanca: 2000, negra: 1000, corchea: 500 });
    const noteDurations = new Set(Object.values(NOTE_DURATIONS_AT_60_BPM));
    RHYTHM_COLORS.forEach(color => {
      expect(new Set(RHYTHM_PATTERNS.map(pattern => pattern[color]))).toEqual(noteDurations);
    });
  });

  it("cambiar de patrón altera el pulso de todos los colores", () => {
    RHYTHM_PATTERNS.forEach((pattern, index) => {
      const next = RHYTHM_PATTERNS[getNextRhythmPatternIndex(index)];
      RHYTHM_COLORS.forEach(color => expect(next[color]).not.toBe(pattern[color]));
    });
  });

  it("avanza solo con la estrella correcta, de la más lenta a la más rápida", () => {
    const order = getSlowestToFastestOrder(0);
    expect(evaluateRhythmPick(0, 0, order[0])).toBe("correct");
    expect(evaluateRhythmPick(0, 1, order[1])).toBe("correct");
    expect(evaluateRhythmPick(0, 2, order[2])).toBe("correct");
    expect(evaluateRhythmPick(0, 3, order[3])).toBe("complete");
    expect(evaluateRhythmPick(0, 0, order[1])).toBe("wrong");
  });

  it("apaga y registra cada estrella correcta hasta completar el orden", () => {
    const order = getSlowestToFastestOrder(0);
    const first = applyRhythmPick(0, [], order[0]);
    expect(first).toEqual({ result: "correct", patternIndex: 0, selectedColors: [order[0]] });

    const second = applyRhythmPick(first.patternIndex, first.selectedColors, order[1]);
    expect(second).toEqual({ result: "correct", patternIndex: 0, selectedColors: order.slice(0, 2) });

    const third = applyRhythmPick(second.patternIndex, second.selectedColors, order[2]);
    const final = applyRhythmPick(third.patternIndex, third.selectedColors, order[3]);
    expect(final.result).toBe("complete");
    expect(final.selectedColors).toEqual(order);
  });

  it("al equivocarse vuelve a encender todas las estrellas y cambia el patrón", () => {
    const order = getSlowestToFastestOrder(0);
    const first = applyRhythmPick(0, [], order[0]);
    const second = applyRhythmPick(first.patternIndex, first.selectedColors, order[1]);
    const retry = applyRhythmPick(second.patternIndex, second.selectedColors, order[3]);

    expect(retry.result).toBe("wrong");
    expect(retry.patternIndex).toBe(getNextRhythmPatternIndex(0));
    expect(retry.selectedColors).toEqual([]);
  });
});
