import { describe, expect, it } from "vitest";
import { RAMBLA_CONVERSATION, resolveRamblaOutcome } from "./ramblaConversationRules";

describe("Rambla conversation rules", () => {
  it("contains three questions with three scored responses each", () => {
    expect(RAMBLA_CONVERSATION).toHaveLength(3);
    for (const question of RAMBLA_CONVERSATION) {
      expect(question.choices).toHaveLength(3);
      expect(question.choices.every(choice => choice.path === "pacifico" || choice.path === "drastico")).toBe(true);
    }
  });

  it("marks only the two physical responses for a visible gesture", () => {
    const gestures = RAMBLA_CONVERSATION.flatMap(question => question.choices.filter(choice => choice.gesture));
    expect(gestures).toHaveLength(2);
    expect(gestures.map(choice => choice.gesture)).toEqual(["roll-back", "citrus-hop"]);
    expect(gestures.every(choice => choice.path === "drastico")).toBe(true);
  });

  it("selects the illumination ending when at least two answers are peaceful", () => {
    expect(resolveRamblaOutcome(2, 1)).toBe(1);
    expect(resolveRamblaOutcome(3, 0)).toBe(1);
  });

  it("selects the citrus sacrifice ending when at least two answers are drastic", () => {
    expect(resolveRamblaOutcome(1, 2)).toBe(2);
    expect(resolveRamblaOutcome(0, 3)).toBe(2);
  });
});
