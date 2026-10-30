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

  it("selects the illumination ending when at least two answers are peaceful", () => {
    expect(resolveRamblaOutcome(2, 1)).toBe(1);
    expect(resolveRamblaOutcome(3, 0)).toBe(1);
  });

  it("selects the citrus sacrifice ending when at least two answers are drastic", () => {
    expect(resolveRamblaOutcome(1, 2)).toBe(2);
    expect(resolveRamblaOutcome(0, 3)).toBe(2);
  });
});
