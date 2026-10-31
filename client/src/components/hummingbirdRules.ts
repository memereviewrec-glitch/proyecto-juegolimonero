export type HummingbirdOutcome = "good" | "bad" | "neutral";

export const FRIENDSHIP_THRESHOLD = 80;
export const NEUTRAL_MIN_SCORE = -80;

export function resolveHummingbirdOutcome(
  score: number,
  isFinalQuestion: boolean,
): HummingbirdOutcome | null {
  if (score >= FRIENDSHIP_THRESHOLD) return "good";
  if (score < NEUTRAL_MIN_SCORE) return "bad";
  return isFinalQuestion ? "neutral" : null;
}
