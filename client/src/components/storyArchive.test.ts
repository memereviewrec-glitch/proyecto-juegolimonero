import { describe, expect, it } from "vitest";
import { hasCompletedAllJaguarEndings, hasUnlockedSecretEnding, JAGUAR_ENDINGS, JAGUAR_REVELATION_TEXT } from "./storyArchive";

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

describe("desbloqueo del epílogo secreto", () => {
  it("habilita la entrada del Libro tras descubrir los cuatro finales", () => {
    expect(hasUnlockedSecretEnding(["empatia", "enigmas"])).toBe(false);
    expect(hasUnlockedSecretEnding(["empatia", "enigmas", "valentia"])).toBe(false);
    expect(hasUnlockedSecretEnding(["empatia", "enigmas", "valentia", "pesadilla"])).toBe(true);
  });

  it("exige haber alcanzado cada uno de los cuatro finales", () => {
    expect(hasCompletedAllJaguarEndings(["empatia", "enigmas", "valentia"])).toBe(false);
    expect(hasCompletedAllJaguarEndings(["empatia", "enigmas", "valentia", "pesadilla"])).toBe(true);
  });

  it("no cuenta duplicados como finales distintos", () => {
    expect(hasCompletedAllJaguarEndings(["empatia", "empatia", "enigmas", "valentia"])).toBe(false);
    expect(JAGUAR_ENDINGS).toHaveLength(4);
  });
});
