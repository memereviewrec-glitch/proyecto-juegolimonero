import type { SeedSongId } from "./components/SeedBook";
import type { GameScene } from "./sceneAccessRules";

export const SEED_SCENE_TARGETS: Readonly<Record<SeedSongId, GameScene>> = {
  intro: "room",
  ventana: "dawn",
  raices: "ruins",
  rambla: "gathering",
  "espiritus-del-rio": "river",
  "el-rio": "el-rio",
  "el-fuego": "fire-forest",
  ponzona: "hummingbird",
  "nueve-sentidos": "nueve-sentidos",
  "el-jaguar": "jaguar",
};

export function getSeedSceneTarget(songId: SeedSongId, discoveredSongIds: readonly SeedSongId[]): GameScene | null {
  return discoveredSongIds.includes(songId) ? SEED_SCENE_TARGETS[songId] : null;
}
