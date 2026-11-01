import { describe, expect, it } from "vitest";
import {
  ANGRY_QUESTIONS,
  CAUTELA_THRESHOLD,
  COURAGE_THRESHOLD,
  EMPATHY_THRESHOLD,
  INGENUITY_ANSWER,
  INGENUITY_RIDDLE,
  INGENUITY_THRESHOLD,
  INNER_QUESTIONS,
  LAUGHING_QUESTIONS,
  NIGHTMARE_VOICEOVER,
  applyJaguarAnswerEffects,
  applyJaguarEffects,
  createInitialJaguarStats,
  getFinalJaguarAdvice,
  getJaguarBranchAfterCautela,
  getJaguarHummingbirdHint,
  resolveFightOutcome,
  meetsJaguarThreshold,
  scaleJaguarAnswerEffects,
} from "./jaguarRules";

describe("reglas de El Jaguar", () => {
  it("silbar suma exactamente 7 de Valentía y observar a los pájaros suma 7 de Cautela", () => {
    const history = { ramblaOutcome: null, hummingbirdOutcome: null };
    expect(createInitialJaguarStats({ ...history, dawnOutcome: "A" })).toEqual({
      cautela: 35, empatia: 35, ingenio: 35, valentia: 42,
    });
    expect(createInitialJaguarStats({ ...history, dawnOutcome: "B" })).toEqual({
      cautela: 42, empatia: 35, ingenio: 35, valentia: 35,
    });
    expect(createInitialJaguarStats({ ...history, dawnOutcome: null })).toEqual(createInitialJaguarStats(history));
  });

  it("recalcula una sola recompensa del amanecer sin acumularla al repetir o cambiar de ruta", () => {
    const history = { ramblaOutcome: null, hummingbirdOutcome: null, dawnOutcome: "A" as const };
    const first = createInitialJaguarStats(history);
    expect(createInitialJaguarStats(history)).toEqual(first);
    expect(createInitialJaguarStats({ ...history, dawnOutcome: "B" })).toEqual({
      cautela: 42, empatia: 35, ingenio: 35, valentia: 35,
    });
  });

  it("combina la recompensa del amanecer con Rambla, el colibrí y ambas decisiones del río", () => {
    const history = {
      ramblaOutcome: 1 as const,
      hummingbirdOutcome: "good" as const,
      riverConversationOutcome: { route: "pacifico" as const, choiceIndex: 1 },
      riverChallengeOutcome: "current" as const,
    };
    expect(createInitialJaguarStats({ ...history, dawnOutcome: "A" })).toEqual({
      cautela: 42, empatia: 52, ingenio: 35, valentia: 52,
    });
    expect(createInitialJaguarStats({ ...history, dawnOutcome: "B" })).toEqual({
      cautela: 49, empatia: 52, ingenio: 35, valentia: 45,
    });
  });

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

  it("incorpora cada respuesta de la primera conversación del Río en Cautela o Valentía, nunca en Ingenio", () => {
    const cases = [
      [{ route: "pacifico", choiceIndex: 0 }, { cautela: 39, empatia: 35, ingenio: 35, valentia: 35 }],
      [{ route: "pacifico", choiceIndex: 1 }, { cautela: 35, empatia: 35, ingenio: 35, valentia: 39 }],
      [{ route: "pacifico", choiceIndex: 2 }, { cautela: 38, empatia: 35, ingenio: 35, valentia: 35 }],
      [{ route: "drastico", choiceIndex: 0 }, { cautela: 35, empatia: 35, ingenio: 35, valentia: 40 }],
      [{ route: "drastico", choiceIndex: 1 }, { cautela: 40, empatia: 35, ingenio: 35, valentia: 35 }],
      [{ route: "drastico", choiceIndex: 2 }, { cautela: 37, empatia: 35, ingenio: 35, valentia: 38 }],
    ] as const;
    for (const [riverConversationOutcome, expected] of cases) {
      expect(createInitialJaguarStats({ ramblaOutcome: null, hummingbirdOutcome: null, riverConversationOutcome })).toEqual(expected);
    }
    expect(createInitialJaguarStats({
      ramblaOutcome: null,
      hummingbirdOutcome: null,
      riverConversationOutcome: { route: "pacifico", choiceIndex: 1 },
      riverChallengeOutcome: "current",
    })).toEqual({ cautela: 35, empatia: 35, ingenio: 35, valentia: 45 });
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

  it("resuelve Cautela, Empatía y Valentía de forma determinista con umbral 70", () => {
    expect(CAUTELA_THRESHOLD).toBe(70);
    expect(EMPATHY_THRESHOLD).toBe(70);
    expect(COURAGE_THRESHOLD).toBe(70);
    for (const threshold of [CAUTELA_THRESHOLD, EMPATHY_THRESHOLD, COURAGE_THRESHOLD]) {
      expect(meetsJaguarThreshold(threshold - 1, threshold)).toBe(false);
      expect(meetsJaguarThreshold(threshold, threshold)).toBe(true);
      expect(meetsJaguarThreshold(100, threshold)).toBe(true);
    }
  });

  it("usa el umbral determinista de 70 para Ingenio", () => {
    expect(INGENUITY_THRESHOLD).toBe(70);
    expect(meetsJaguarThreshold(69, INGENUITY_THRESHOLD)).toBe(false);
    expect(meetsJaguarThreshold(70, INGENUITY_THRESHOLD)).toBe(true);
    expect(meetsJaguarThreshold(100, INGENUITY_THRESHOLD)).toBe(true);
  });

  it("dirige el éxito de Cautela a la rama burlona y el fallo a la furiosa", () => {
    expect(getJaguarBranchAfterCautela(true)).toBe("laughing");
    expect(getJaguarBranchAfterCautela(false)).toBe("angry");
  });

  it("da pistas enigmáticas sobre cada atributo sin revelar una respuesta concreta", () => {
    expect(getJaguarHummingbirdHint("cautela-check")).toContain(`Cautela; el umbral es ${CAUTELA_THRESHOLD}`);
    expect(getJaguarHummingbirdHint("angry-check", "empatia")).toContain(`Empatía, y hacen falta ${EMPATHY_THRESHOLD}`);
    expect(getJaguarHummingbirdHint("angry-check", "valentia")).toContain(`Valentía; el umbral está en ${COURAGE_THRESHOLD}`);
    expect(getJaguarHummingbirdHint("ingenio-check")).toContain(`Ingenio debe llegar a ${INGENUITY_THRESHOLD}`);
    expect(getJaguarHummingbirdHint("inner")).toContain("Cautela");
    expect(getJaguarHummingbirdHint("angry-questions")).toContain("Empatía y Valentía");
    expect(getJaguarHummingbirdHint("laughing-questions")).toContain("Ingenio");
    expect(getJaguarHummingbirdHint("inner")).not.toContain(INNER_QUESTIONS[0].answers[0].label);
    expect(getJaguarHummingbirdHint("angry-questions")).not.toContain(ANGRY_QUESTIONS[2].answers[0].label);
    expect(getJaguarHummingbirdHint("laughing-questions")).not.toContain(LAUGHING_QUESTIONS[0].answers[0].label);
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

  it("mantiene alcanzables los cuatro finales tras intercambiar las ramas de Cautela", () => {
    const applySequence = (initial: ReturnType<typeof createInitialJaguarStats>, questions: readonly (typeof INNER_QUESTIONS)[number][], choices: readonly number[]) => (
      choices.reduce((current, choice, index) => applyJaguarAnswerEffects(current, questions[index].answers[choice].effects), initial)
    );

    const historyWithCaution = {
      ramblaOutcome: 1 as const,
      hummingbirdOutcome: "neutral" as const,
      riverConversationOutcome: { route: "pacifico" as const, choiceIndex: 0 },
      riverChallengeOutcome: "shore" as const,
    };
    const enigmaEntry = applySequence(createInitialJaguarStats(historyWithCaution), INNER_QUESTIONS, [1, 2, 0]);
    expect(enigmaEntry.cautela).toBe(CAUTELA_THRESHOLD);
    expect(getJaguarBranchAfterCautela(meetsJaguarThreshold(enigmaEntry.cautela, CAUTELA_THRESHOLD))).toBe("laughing");
    const enigmas = applySequence(enigmaEntry, LAUGHING_QUESTIONS, [0, 0, 0]);
    expect(enigmas.ingenio).toBe(80);
    expect(meetsJaguarThreshold(enigmas.ingenio, INGENUITY_THRESHOLD)).toBe(true);

    const empathyHistory = { ramblaOutcome: 1 as const, hummingbirdOutcome: "good" as const };
    const empathyEntry = applySequence(createInitialJaguarStats(empathyHistory), INNER_QUESTIONS, [2, 1, 2]);
    expect(empathyEntry.cautela).toBeLessThan(CAUTELA_THRESHOLD);
    expect(getJaguarBranchAfterCautela(meetsJaguarThreshold(empathyEntry.cautela, CAUTELA_THRESHOLD))).toBe("angry");
    const empathy = applySequence(empathyEntry, ANGRY_QUESTIONS, [0, 1, 0]);
    expect(empathy.empatia).toBe(92);
    expect(meetsJaguarThreshold(empathy.empatia, EMPATHY_THRESHOLD)).toBe(true);

    const courageHistory = {
      ramblaOutcome: 2 as const,
      hummingbirdOutcome: "bad" as const,
      riverChallengeOutcome: "current" as const,
    };
    const courageEntry = applySequence(createInitialJaguarStats(courageHistory), INNER_QUESTIONS, [0, 3, 3]);
    expect(courageEntry.cautela).toBeLessThan(CAUTELA_THRESHOLD);
    expect(getJaguarBranchAfterCautela(meetsJaguarThreshold(courageEntry.cautela, CAUTELA_THRESHOLD))).toBe("angry");
    const courage = applySequence(courageEntry, ANGRY_QUESTIONS, [1, 2, 1]);
    expect(courage.valentia).toBe(95);
    expect(meetsJaguarThreshold(courage.valentia, COURAGE_THRESHOLD)).toBe(true);
    expect(resolveFightOutcome(0, 3)).toBe("victory");
    expect(resolveFightOutcome(2, 3)).toBe("nightmare");
  });

  it("elige el consejo según la estadística final más alta", () => {
    expect(getFinalJaguarAdvice({ cautela: 50, empatia: 51, ingenio: 50, valentia: 49 }).stat).toBe("empatia");
    expect(getFinalJaguarAdvice({ cautela: 90, empatia: 50, ingenio: 85, valentia: 60 }).text).toContain("escuchar el bosque");
  });
});
