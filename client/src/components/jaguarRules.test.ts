import { describe, expect, it } from "vitest";
import {
  ANGRY_QUESTIONS,
  INGENUITY_ANSWER,
  INGENUITY_RIDDLE,
  LAUGHING_QUESTIONS,
  NIGHTMARE_VOICEOVER,
  applyJaguarAnswerEffects,
  applyJaguarEffects,
  createInitialJaguarStats,
  getFinalJaguarAdvice,
  resolveFightOutcome,
  resolveJaguarCheck,
  scaleJaguarAnswerEffects,
} from "./jaguarRules";

describe("reglas de El Jaguar", () => {
  it("inclina las estadísticas iniciales con las decisiones guardadas de Rambla y el colibrí", () => {
    expect(createInitialJaguarStats({ ramblaOutcome: 1, hummingbirdOutcome: "good" })).toEqual({
      cautela: 42,
      empatia: 52,
      ingenio: 35,
      valentia: 35,
    });
    expect(createInitialJaguarStats({ ramblaOutcome: 2, hummingbirdOutcome: "bad" })).toEqual({
      cautela: 35,
      empatia: 35,
      ingenio: 40,
      valentia: 53,
    });
  });

  it("aplica al colibrí amigo solo Empatía y al neutral solo Cautela, sin subir Ingenio", () => {
    expect(createInitialJaguarStats({ ramblaOutcome: null, hummingbirdOutcome: "good" })).toEqual({
      cautela: 35,
      empatia: 45,
      ingenio: 35,
      valentia: 35,
    });
    expect(createInitialJaguarStats({ ramblaOutcome: null, hummingbirdOutcome: "neutral" })).toEqual({
      cautela: 42,
      empatia: 35,
      ingenio: 35,
      valentia: 35,
    });
  });

  it("inclina estadísticas iniciales distintas según la respuesta de Espíritus del Río", () => {
    expect(createInitialJaguarStats({ ramblaOutcome: null, hummingbirdOutcome: null, riverChallengeOutcome: "current" })).toEqual({
      cautela: 35,
      empatia: 35,
      ingenio: 35,
      valentia: 41,
    });
    expect(createInitialJaguarStats({ ramblaOutcome: null, hummingbirdOutcome: null, riverChallengeOutcome: "shore" })).toEqual({
      cautela: 41,
      empatia: 35,
      ingenio: 35,
      valentia: 35,
    });
  });

  it("deja la elección entre Empatía y Valentía para la pregunta 3/3 de la rama furiosa", () => {
    expect(ANGRY_QUESTIONS.map(question => question.answers.length)).toEqual([3, 3, 2]);
    expect(ANGRY_QUESTIONS[2].answers.map(answer => answer.approach)).toEqual(["empatia", "valentia"]);
  });

  it("separa el tercer enigma conversacional del enunciado de la tirada de Ingenio", () => {
    expect(LAUGHING_QUESTIONS[2].prompt).toBe("Último acertijo: ¿qué conocimiento desaparece en cuanto intentas poseerlo?");
    expect(INGENUITY_RIDDLE).toContain("¿Qué milagro permite que la flor florezca en el cieno sin ensuciar sus pétalos?");
    expect(INGENUITY_ANSWER).toContain("El milagro no es alterar el mundo de los sueños, sino despertar en medio de ellos.");
  });

  it("mantiene cada estadística entre 0 y 100 al aplicar los efectos de una respuesta", () => {
    const stats = createInitialJaguarStats({ ramblaOutcome: null, hummingbirdOutcome: null });
    expect(applyJaguarEffects(stats, { cautela: -90, ingenio: 100 })).toEqual({
      cautela: 0,
      empatia: 35,
      ingenio: 100,
      valentia: 35,
    });
  });

  it("reduce más las respuestas medianas de Ingenio y deja la recompensa mayor alcanzable", () => {
    expect(scaleJaguarAnswerEffects({ ingenio: 8, cautela: 3, empatia: -7 })).toEqual({ ingenio: 5, cautela: 2, empatia: -5 });
    expect(scaleJaguarAnswerEffects({ ingenio: 14 })).toEqual({ ingenio: 10 });
    expect(scaleJaguarAnswerEffects({ ingenio: 13 })).toEqual({ ingenio: 9 });
    expect(applyJaguarAnswerEffects({ cautela: 35, empatia: 35, ingenio: 35, valentia: 35 }, { ingenio: 8, cautela: 3 })).toEqual({
      cautela: 37,
      empatia: 35,
      ingenio: 40,
      valentia: 35,
    });
    expect(createInitialJaguarStats({ ramblaOutcome: 1, hummingbirdOutcome: "good" }).cautela).toBe(42);
  });

  it("exige el umbral del 50% para que una tirada de Empatía sea elegible", () => {
    expect(resolveJaguarCheck(49, 1, 50)).toMatchObject({ eligible: false, success: false });
    expect(resolveJaguarCheck(50, 50, 50)).toMatchObject({ eligible: true, success: true });
    expect(resolveJaguarCheck(70, 71, 50)).toMatchObject({ eligible: true, success: false });
  });

  it("exige el umbral del 85% de Ingenio antes de resolver la tirada", () => {
    expect(resolveJaguarCheck(84, 1, 85)).toMatchObject({ eligible: false, success: false });
    expect(resolveJaguarCheck(85, 85, 85)).toMatchObject({ eligible: true, success: true });
    expect(resolveJaguarCheck(85, 86, 85)).toMatchObject({ eligible: true, success: false });
  });

  it("lleva a pesadilla si se fallan dos de los tres movimientos", () => {
    expect(resolveFightOutcome(1, 2)).toBe("continue");
    expect(resolveFightOutcome(2, 2)).toBe("continue");
    expect(resolveFightOutcome(1, 3)).toBe("victory");
    expect(resolveFightOutcome(2, 3)).toBe("nightmare");
  });

  it("mantiene la voz en off de Pesadilla sin revelar al jaguar como dios", () => {
    expect(NIGHTMARE_VOICEOVER).toBe("Tu mente misma creó la selva y al depredador. Al igual que cuando alguien se libera de las ataduras pero corre de regreso a enredarse, a menudo recreamos nuestros propios temores. El sueño muestra cómo la mente construye el miedo a la disolución, pero al despertar comprendemos que no era más que una ilusión.");
    expect(NIGHTMARE_VOICEOVER.toLowerCase()).not.toContain("dios");
  });

  it("elige el consejo según la estadística final más alta", () => {
    expect(getFinalJaguarAdvice({ cautela: 50, empatia: 51, ingenio: 50, valentia: 49 }).stat).toBe("empatia");
    expect(getFinalJaguarAdvice({ cautela: 90, empatia: 50, ingenio: 85, valentia: 60 }).text).toContain("escuchar el bosque");
  });
});
