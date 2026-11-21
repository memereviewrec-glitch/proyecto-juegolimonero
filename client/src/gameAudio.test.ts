import { describe, expect, it } from "vitest";
import { GAME_MUSIC_VOLUME, resolveGameAssetUrl } from "./gameAudio";

describe("rutas públicas del juego", () => {
  it("prefija un recurso con la base de GitHub Pages", () => {
    expect(resolveGameAssetUrl("/seedbook-art.png", "/proyecto-juegolimonero/")).toBe(
      "/proyecto-juegolimonero/seedbook-art.png",
    );
  });

  it("no repite el prefijo cuando ya viene incluido en el recurso", () => {
    expect(resolveGameAssetUrl("/proyecto-juegolimonero/seedbook-art.png", "/proyecto-juegolimonero/")).toBe(
      "/proyecto-juegolimonero/seedbook-art.png",
    );
  });

  it("normaliza la base sin barra final y la ruta sin barra inicial", () => {
    expect(resolveGameAssetUrl("seedbook-art.png", "/proyecto-juegolimonero")).toBe(
      "/proyecto-juegolimonero/seedbook-art.png",
    );
  });

  it("mantiene las rutas absolutas del servidor de desarrollo", () => {
    expect(resolveGameAssetUrl("/seedbook-art.png", "/")).toBe("/seedbook-art.png");
  });
});

describe("volumen de la música de fondo", () => {
  it("mantiene un volumen fijo durante todo el juego", () => {
    expect(GAME_MUSIC_VOLUME).toBe(0.36);
  });
});
