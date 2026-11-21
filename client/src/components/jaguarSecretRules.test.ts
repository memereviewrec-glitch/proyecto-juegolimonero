import { describe, expect, it } from "vitest";
import { hasCompletedAllJaguarEndings } from "./storyArchive";
import {
  SECRET_MAZE_CENTER,
  SECRET_MAZE_START,
  SECRET_QUESTION,
  SECRET_SLEEPING_TEXT,
  SECRET_TREE_INSCRIPTION,
  advanceSecretScreen,
  canOccupyMazePosition,
  hasReachedMazeCenter,
  moveSecretLemon,
  type SecretMazeMask,
} from "./jaguarSecretRules";

describe("desbloqueo del epílogo secreto de Jaguar", () => {
  it("solo se desbloquea al reunir los cuatro finales distintos", () => {
    expect(hasCompletedAllJaguarEndings([])).toBe(false);
    expect(hasCompletedAllJaguarEndings(["empatia", "enigmas", "valentia"])).toBe(false);
    expect(hasCompletedAllJaguarEndings(["empatia", "empatia", "enigmas", "valentia", "pesadilla"])).toBe(true);
  });

  it("conserva literalmente los dos textos y la inscripción del árbol", () => {
    expect(SECRET_QUESTION).toBe("Crees que limón sigue durmiendo, pero... ¿Cómo podríamos saberlo? Al fin y al cabo, ¿cómo puede un limón despertar?");
    expect(SECRET_SLEEPING_TEXT).toBe("Partir, partir, partir a lo alto, partir a lo más alto, despertar, así sea. No hay ignorancia, ni fin de la ignorancia. No hay vejez y muerte, ni fin de la vejez y muerte. No hay sufrimiento, ni origen, ni cesación, ni camino. No hay sabiduría, ni logro, ni no-logro");
    expect(SECRET_TREE_INSCRIPTION).toBe("como es arriba, así es abajo");
  });
});

describe("rutas narrativas del epílogo secreto", () => {
	it("despertar muestra la caída antes del árbol; tocar la cueva abre una oferta antes de entrar", () => {
		expect(advanceSecretScreen("question", "wake")).toBe("fall-interlude");
		expect(advanceSecretScreen("fall-interlude", "continue-fall")).toBe("tree");
    expect(advanceSecretScreen("tree", "touch-cave")).toBe("cave-offer");
    expect(advanceSecretScreen("cave-offer", "enter-cave")).toBe("maze");
    expect(advanceSecretScreen("cave-offer", "leave-cave")).toBe("tree");
  });

	it("no despertar lleva a la lechuza y no abre el laberinto; despertar permite entrar y llegar a la superficie", () => {
			expect(advanceSecretScreen("question", "stay-asleep")).toBe("sleep-interlude");
			expect(advanceSecretScreen("sleep-interlude", "continue-sleep")).toBe("owl");
			expect(advanceSecretScreen("owl", "enter-cave")).toBe("owl");
		expect(advanceSecretScreen("cave-offer", "enter-cave")).toBe("maze");
	    expect(advanceSecretScreen("maze", "escape-maze")).toBe("canopy-entry");
	    expect(advanceSecretScreen("canopy-entry", "meet-owl")).toBe("riddle");
	    expect(advanceSecretScreen("riddle", "return-to-door")).toBe("riddle-fail");
	    expect(advanceSecretScreen("riddle-fail", "return-to-door")).toBe("tree");
	    expect(advanceSecretScreen("tree", "escape-maze")).toBe("tree");
	    expect(advanceSecretScreen("surface", "escape-maze")).toBe("surface");
  });
});

describe("laberinto PNG de raíces con colisiones y centro objetivo", () => {
  const mask: SecretMazeMask = { width: 100, height: 100, alpha: new Uint8Array(100 * 100) };

	it("inicia a Limón en la abertura sudeste inferior derecha y define la cámara central como objetivo", () => {
		expect(SECRET_MAZE_START).toEqual({ x: 92, y: 62 });
    expect(hasReachedMazeCenter(SECRET_MAZE_CENTER)).toBe(true);
    expect(hasReachedMazeCenter({ x: 25, y: 25 })).toBe(false);
  });

  it("permite avanzar por transparencia y detecta las líneas opacas como raíces bloqueantes", () => {
    const verticalRoot = { ...mask, alpha: new Uint8Array(mask.alpha) };
    for (let y = 0; y < 100; y++) verticalRoot.alpha[y * 100 + 55] = 255;
    expect(canOccupyMazePosition({ x: 35, y: 50 }, verticalRoot)).toBe(true);
    expect(canOccupyMazePosition({ x: 55, y: 50 }, verticalRoot)).toBe(false);
    const move = moveSecretLemon({ x: 35, y: 50 }, "right", verticalRoot);
    expect(move.position.x).toBeGreaterThan(35);
    expect(move.position.x).toBeLessThan(50);
    expect(move.escaped).toBe(false);
  });

  it("termina la ruta únicamente al alcanzar la zona central", () => {
    const move = moveSecretLemon({ x: 49.5, y: 50 }, "right", mask);
    expect(move.escaped).toBe(true);
    expect(hasReachedMazeCenter(move.position)).toBe(true);
  });
});
