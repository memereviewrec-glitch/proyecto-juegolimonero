import { describe, expect, it } from "vitest";
import { createInitialJaguarStats } from "./jaguarRules";
import { RIVER_CHALLENGE_ROUTES } from "./riverChallengeRules";
import { isSceneUnlocked } from "../sceneAccessRules";

describe("las dos rutas del reto del río", () => {
  it("entrar en la corriente expresa Valentía y mantiene solo su bonificación de seis", () => {
    const route = RIVER_CHALLENGE_ROUTES.current;
    expect(route.choice).toBe("Entrar en la corriente sin miedo.");
    expect(route.trait).toBe("valentia");
    expect(route.reply).toContain("reconocen su valentía");
    expect(route.descent).toContain("se entrega a la corriente");
    expect(createInitialJaguarStats({ ramblaOutcome: null, hummingbirdOutcome: null, riverChallengeOutcome: "current" })).toEqual({ cautela: 35, empatia: 35, ingenio: 35, valentia: 41 });
  });

  it("retirarse expresa Cautela y los espíritus abren una ruta sin corriente", () => {
    const route = RIVER_CHALLENGE_ROUTES.shore;
    expect(route.choice).toContain("Retirarme hacia la orilla");
    expect(route.trait).toBe("cautela");
    expect(route.reply).toContain("se retira hacia la orilla con cautela");
    expect(route.reply).toContain("sin entrar en la corriente");
    expect(route.descent).toContain("abren las aguas");
    expect(createInitialJaguarStats({ ramblaOutcome: null, hummingbirdOutcome: null, riverChallengeOutcome: "shore" })).toEqual({ cautela: 41, empatia: 35, ingenio: 35, valentia: 35 });
  });

  it("ambas decisiones conducen al fondo y abren El Río con su desenlace guardado", () => {
    for (const outcome of ["current", "shore"] as const) {
      expect(RIVER_CHALLENGE_ROUTES[outcome].reply).toContain("fondo del río");
      expect(RIVER_CHALLENGE_ROUTES[outcome].descent).toContain("fondo");
      expect(isSceneUnlocked("el-rio", { currentScene: "river-challenge", discoveredSeedIds: [], riverChallengeComplete: false, riverChallengeOutcome: outcome })).toBe(true);
    }
    expect(RIVER_CHALLENGE_ROUTES.shore.reply).not.toBe(RIVER_CHALLENGE_ROUTES.current.reply);
    expect(RIVER_CHALLENGE_ROUTES.shore.descent).not.toBe(RIVER_CHALLENGE_ROUTES.current.descent);
  });
});
