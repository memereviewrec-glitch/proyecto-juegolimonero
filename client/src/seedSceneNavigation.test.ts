import { describe, expect, it } from "vitest";
import { SONG_CATALOG, type SeedSongId } from "./components/SeedBook";
import { getSeedSceneTarget, SEED_SCENE_TARGETS } from "./seedSceneNavigation";

const catalogIds = SONG_CATALOG.map(song => song.id).sort();
const mappedIds = Object.keys(SEED_SCENE_TARGETS).sort();

describe("navegación desde una semilla", () => {
  it("asocia exactamente las diez canciones del Libro con su escena", () => {
    expect(mappedIds).toEqual(catalogIds);
  });

  it("regresa a la escena correspondiente solo cuando la semilla está descubierta", () => {
    for (const song of SONG_CATALOG) {
      expect(getSeedSceneTarget(song.id, [song.id])).toBe(SEED_SCENE_TARGETS[song.id as SeedSongId]);
    }
  });

  it("no permite saltar a la escena de una semilla bloqueada", () => {
    expect(getSeedSceneTarget("ventana", ["intro"])).toBeNull();
  });
});
