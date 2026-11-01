import { describe, expect, it } from "vitest";
import { isSceneUnlocked, type GameScene } from "./sceneAccessRules";

const emptyProgress = {
  currentScene: "room" as GameScene,
  discoveredSeedIds: [] as string[],
  riverChallengeComplete: false,
  riverChallengeOutcome: null as "current" | "shore" | null,
};

describe("acceso a escenas separado del intento actual", () => {
  it.each([
    ["dawn", "intro"],
    ["ruins", "ventana"],
    ["gathering", "raices"],
    ["river", "rambla"],
    ["river-challenge", "espiritus-del-rio"],
    ["fire-forest", "el-rio"],
    ["hummingbird", "el-fuego"],
    ["nueve-sentidos", "ponzona"],
    ["jaguar", "nueve-sentidos"],
  ] as const)("%s usa la semilla guardada %s aunque el intento se reinicie", (scene, seed) => {
    expect(isSceneUnlocked(scene, emptyProgress)).toBe(false);
    expect(isSceneUnlocked(scene, { ...emptyProgress, discoveredSeedIds: [seed] })).toBe(true);
  });

  it("El Río se abre con el reto actual o su desenlace guardado", () => {
    expect(isSceneUnlocked("el-rio", emptyProgress)).toBe(false);
    expect(isSceneUnlocked("el-rio", { ...emptyProgress, riverChallengeComplete: true })).toBe(true);
    for (const outcome of ["current", "shore"] as const) {
      expect(isSceneUnlocked("el-rio", { ...emptyProgress, riverChallengeOutcome: outcome })).toBe(true);
    }
  });

  it("una partida antigua con El Río descubierto no queda bloqueada sin el desenlace del reto", () => {
    expect(isSceneUnlocked("el-rio", { ...emptyProgress, discoveredSeedIds: ["el-rio"] })).toBe(true);
  });

  it("conserva las restricciones previas del local y del amanecer", () => {
    expect(isSceneUnlocked("room", emptyProgress)).toBe(true);
    expect(isSceneUnlocked("room", { ...emptyProgress, currentScene: "jaguar" })).toBe(false);
    for (const currentScene of ["ruins", "gathering"] as const) {
      expect(isSceneUnlocked("dawn", { ...emptyProgress, currentScene, discoveredSeedIds: ["intro"] })).toBe(false);
    }
  });

  it("no modifica la colección ni los datos históricos consultados", () => {
    const seeds = Object.freeze(["el-rio", "el-fuego", "ponzona", "nueve-sentidos"]);
    const progress = Object.freeze({ ...emptyProgress, discoveredSeedIds: seeds });
    expect(isSceneUnlocked("jaguar", progress)).toBe(true);
    expect(progress.discoveredSeedIds).toEqual(seeds);
    expect(progress.riverChallengeComplete).toBe(false);
    expect(progress.riverChallengeOutcome).toBeNull();
  });
});
