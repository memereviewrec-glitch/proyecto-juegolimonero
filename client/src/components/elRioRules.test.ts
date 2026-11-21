import { describe, expect, it } from "vitest";
import { recordBlackFishReply } from "./elRioRules";

describe("respuestas del pez negro en El Río", () => {
  it("solo considera completas las cuatro respuestas asociadas a peces de color", () => {
    let replies: ReturnType<typeof recordBlackFishReply>["replies"] = [];
    for (const color of ["amarillo", "rojo", "azul"] as const) {
      const result = recordBlackFishReply(replies, color);
      replies = result.replies;
      expect(result.allRead).toBe(false);
    }
    const finalReply = recordBlackFishReply(replies, "verde");
    expect(finalReply.allRead).toBe(true);
    expect(finalReply.replies).toEqual(["amarillo", "rojo", "azul", "verde"]);
    expect(finalReply.newlyRead).toBe(true);
  });

  it("repetir una respuesta no cuenta como una respuesta nueva ni duplica el registro", () => {
    const first = recordBlackFishReply([], "verde");
    const repeated = recordBlackFishReply(first.replies, "verde");
    expect(repeated.newlyRead).toBe(false);
    expect(repeated.replies).toEqual(["verde"]);
    expect(repeated.allRead).toBe(false);
  });
});
