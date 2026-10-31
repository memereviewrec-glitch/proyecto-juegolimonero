export const RHYTHM_COLORS = ["red", "green", "blue", "yellow"] as const;
export type RhythmColor = typeof RHYTHM_COLORS[number];

export type StarRhythmPattern = Readonly<Record<RhythmColor, number>>;

/** Duración de un ciclo de destello por color, en milisegundos. */
export const RHYTHM_PATTERNS: readonly StarRhythmPattern[] = [
  { red: 720, green: 480, blue: 1400, yellow: 2200 },
  { red: 2000, green: 1100, blue: 540, yellow: 1500 },
  { red: 620, green: 2400, blue: 1300, yellow: 880 },
  { red: 1700, green: 900, blue: 2300, yellow: 510 },
];

export function getFastestToSlowestOrder(patternIndex: number): RhythmColor[] {
  const pattern = RHYTHM_PATTERNS[patternIndex] ?? RHYTHM_PATTERNS[0];
  return [...RHYTHM_COLORS].sort((first, second) => pattern[first] - pattern[second]);
}

export function getNextRhythmPatternIndex(currentIndex: number): number {
  const safeIndex = ((Math.floor(currentIndex) % RHYTHM_PATTERNS.length) + RHYTHM_PATTERNS.length) % RHYTHM_PATTERNS.length;
  return (safeIndex + 1) % RHYTHM_PATTERNS.length;
}

export function evaluateRhythmPick(patternIndex: number, selectedCount: number, color: RhythmColor): "wrong" | "correct" | "complete" {
  const order = getFastestToSlowestOrder(patternIndex);
  if (order[selectedCount] !== color) return "wrong";
  return selectedCount === order.length - 1 ? "complete" : "correct";
}
