export type GameScene = "room" | "dawn" | "ruins" | "gathering" | "river" | "river-challenge" | "el-rio" | "fire-forest" | "hummingbird" | "nueve-sentidos" | "jaguar";

type SceneAccessProgress = {
  currentScene: GameScene;
  discoveredSeedIds: readonly string[];
  riverChallengeComplete: boolean;
  riverChallengeOutcome: "current" | "shore" | null;
};

// La colección desbloquea escenas; no demuestra que el intento actual esté superado.
export function isSceneUnlocked(targetScene: GameScene, progress: SceneAccessProgress): boolean {
  const hasSeed = (id: string) => progress.discoveredSeedIds.includes(id);
  switch (targetScene) {
    case "room": return progress.currentScene === "room";
    case "dawn": return hasSeed("intro") && progress.currentScene !== "ruins" && progress.currentScene !== "gathering";
    case "ruins": return hasSeed("ventana");
    case "gathering": return hasSeed("raices");
    case "river": return hasSeed("rambla");
    case "river-challenge": return hasSeed("espiritus-del-rio");
    case "el-rio": return progress.riverChallengeComplete || progress.riverChallengeOutcome !== null || hasSeed("el-rio");
    case "fire-forest": return hasSeed("el-rio");
    case "hummingbird": return hasSeed("el-fuego");
    case "nueve-sentidos": return hasSeed("ponzona");
    case "jaguar": return hasSeed("nueve-sentidos");
  }
}
