export const RHYTHM_COLORS = ["red", "green", "blue", "yellow"] as const;
export type RhythmColor = typeof RHYTHM_COLORS[number];

export type StarRhythmPattern = Readonly<Record<RhythmColor, number>>;
export type RhythmPickResult = "wrong" | "correct" | "complete";

export type RhythmPickTransition = {
  result: RhythmPickResult;
  patternIndex: number;
  selectedColors: RhythmColor[];
};

export const NOTE_DURATIONS_AT_60_BPM = {
  redonda: 4_000,
  blanca: 2_000,
  negra: 1_000,
  corchea: 500,
} as const;

/** Duración de un ciclo de destello por color, en milisegundos. */
export const RHYTHM_PATTERNS: readonly StarRhythmPattern[] = [
  { red: NOTE_DURATIONS_AT_60_BPM.redonda, green: NOTE_DURATIONS_AT_60_BPM.blanca, blue: NOTE_DURATIONS_AT_60_BPM.negra, yellow: NOTE_DURATIONS_AT_60_BPM.corchea },
  { red: NOTE_DURATIONS_AT_60_BPM.blanca, green: NOTE_DURATIONS_AT_60_BPM.negra, blue: NOTE_DURATIONS_AT_60_BPM.corchea, yellow: NOTE_DURATIONS_AT_60_BPM.redonda },
  { red: NOTE_DURATIONS_AT_60_BPM.negra, green: NOTE_DURATIONS_AT_60_BPM.corchea, blue: NOTE_DURATIONS_AT_60_BPM.redonda, yellow: NOTE_DURATIONS_AT_60_BPM.blanca },
  { red: NOTE_DURATIONS_AT_60_BPM.corchea, green: NOTE_DURATIONS_AT_60_BPM.redonda, blue: NOTE_DURATIONS_AT_60_BPM.blanca, yellow: NOTE_DURATIONS_AT_60_BPM.negra },
];

export function getSlowestToFastestOrder(patternIndex: number): RhythmColor[] {
  const pattern = RHYTHM_PATTERNS[patternIndex] ?? RHYTHM_PATTERNS[0];
  return [...RHYTHM_COLORS].sort((first, second) => pattern[second] - pattern[first]);
}

export function getNextRhythmPatternIndex(currentIndex: number): number {
  const safeIndex = ((Math.floor(currentIndex) % RHYTHM_PATTERNS.length) + RHYTHM_PATTERNS.length) % RHYTHM_PATTERNS.length;
  return (safeIndex + 1) % RHYTHM_PATTERNS.length;
}

export function evaluateRhythmPick(patternIndex: number, selectedCount: number, color: RhythmColor): RhythmPickResult {
  const order = getSlowestToFastestOrder(patternIndex);
  if (order[selectedCount] !== color) return "wrong";
  return selectedCount === order.length - 1 ? "complete" : "correct";
}

export function applyRhythmPick(
  patternIndex: number,
  selectedColors: readonly RhythmColor[],
  color: RhythmColor,
): RhythmPickTransition {
  const result = evaluateRhythmPick(patternIndex, selectedColors.length, color);
  if (result === "wrong") {
    return {
      result,
      patternIndex: getNextRhythmPatternIndex(patternIndex),
      selectedColors: [],
    };
  }

  return { result, patternIndex, selectedColors: [...selectedColors, color] };
}
