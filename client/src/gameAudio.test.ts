import { describe, expect, it } from "vitest";
import { resolveGameAssetUrl, resolveGameMusicVolume } from "./gameAudio";

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
  it("respeta el volumen elegido por el jugador", () => {
    expect(resolveGameMusicVolume(36, false)).toBeCloseTo(0.36);
  });

  it("atenúa la música a un 30 % del volumen elegido durante un diálogo", () => {
    expect(resolveGameMusicVolume(36, true)).toBeCloseTo(0.108);
  });

  it("limita el volumen dentro del rango seguro del reproductor", () => {
    expect(resolveGameMusicVolume(-10, false)).toBe(0);
    expect(resolveGameMusicVolume(120, false)).toBe(1);
  });
});
