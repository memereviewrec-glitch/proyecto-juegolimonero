import { describe, expect, it } from "vitest";
import { JAGUAR_ENDINGS, JAGUAR_REVELATION_TEXT } from "./storyArchive";

describe("texto de revelación de El Jaguar", () => {
  it("mantiene el mensaje exacto en el archivo de Enigmas", () => {
    expect(JAGUAR_REVELATION_TEXT).toBe(
      "El jaguar deja de ser una bestia y se revela como espíritu, ha estado hablando con el limón a través de sus sueños.",
    );

    const enigmasEnding = JAGUAR_ENDINGS.find((ending) => ending.id === "enigmas");
    expect(enigmasEnding?.summary).toBe(`El limón resuelve los enigmas. ${JAGUAR_REVELATION_TEXT}`);
    expect(enigmasEnding?.summary).not.toContain("dios del conocimiento");
  });
});
