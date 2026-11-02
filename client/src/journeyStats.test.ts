import { describe, expect, it } from "vitest";
import { createInitialJaguarStats, type JaguarHistory } from "./components/jaguarRules";
import { getJourneyHudStats, getJourneyStatsHistory } from "./journeyStats";

const savedHistory: JaguarHistory = {
  dawnOutcome: "B",
  ramblaOutcome: 1,
  riverConversationOutcome: { route: "pacifico", choiceIndex: 2 },
  riverChallengeOutcome: "shore",
  hummingbirdOutcome: "good",
  nueveSentidosSeedCollected: true,
};
const baseStats = { cautela: 35, empatia: 35, ingenio: 35, valentia: 35 };
const finalSnapshot = {
  history: savedHistory,
  stats: { cautela: 91, empatia: 87, ingenio: 80, valentia: 73 },
};

describe("HUD cronológico al reescribir historia", () => {
  it("vuelve a 35 en los cuatro atributos al entrar a Ventana incluso después de Jaguar", () => {
    expect(getJourneyHudStats(savedHistory, "dawn", false, finalSnapshot)).toEqual(baseStats);
    expect(getJourneyHudStats(savedHistory, "room", false, finalSnapshot)).toEqual(baseStats);
  });

  it("añade solo la nueva decisión del amanecer y nunca anticipa recompensas posteriores", () => {
    expect(getJourneyHudStats(savedHistory, "dawn", true, finalSnapshot)).toEqual({ ...baseStats, cautela: 42 });
    const newHistory = { ...savedHistory, dawnOutcome: "A" as const };
    expect(getJourneyHudStats(newHistory, "dawn", true)).toEqual({ ...baseStats, valentia: 42 });
    expect(getJourneyHudStats(newHistory, "dawn", true)).toEqual({ ...baseStats, valentia: 42 });
    expect(getJourneyHudStats(newHistory, "dawn", false)).toEqual(baseStats);
  });

  it("mantiene solo los capítulos anteriores antes de resolver cada intento", () => {
    const stages = [
      ["gathering", { dawnOutcome: savedHistory.dawnOutcome, ramblaOutcome: null, hummingbirdOutcome: null }],
      ["river", { dawnOutcome: savedHistory.dawnOutcome, ramblaOutcome: savedHistory.ramblaOutcome, hummingbirdOutcome: null }],
      ["river-challenge", { ...savedHistory, riverChallengeOutcome: null, hummingbirdOutcome: null, nueveSentidosSeedCollected: false }],
      ["hummingbird", { ...savedHistory, hummingbirdOutcome: null, nueveSentidosSeedCollected: false }],
      ["nueve-sentidos", { ...savedHistory, nueveSentidosSeedCollected: false }],
    ] as const;
    for (const [scene, historyAtEntry] of stages) {
      expect(getJourneyHudStats(savedHistory, scene, false, finalSnapshot)).toEqual(createInitialJaguarStats(historyAtEntry));
    }
  });

  it("incorpora la nueva recompensa al resolver el capítulo y elimina el duplicado anterior", () => {
    const beforeRambla = getJourneyStatsHistory(savedHistory, "gathering", false);
    const afterRambla = getJourneyStatsHistory({ ...savedHistory, ramblaOutcome: 2 }, "gathering", true);
    expect(beforeRambla.ramblaOutcome).toBeNull();
    expect(afterRambla.ramblaOutcome).toBe(2);
    expect(afterRambla.riverConversationOutcome).toBeNull();
    expect(afterRambla.hummingbirdOutcome).toBeNull();
    const riverHistory = { ...savedHistory, riverConversationOutcome: { route: "pacifico" as const, choiceIndex: 0 } };
    expect(getJourneyHudStats(riverHistory, "river", true)).toEqual(createInitialJaguarStats({
      ...riverHistory, riverChallengeOutcome: null, hummingbirdOutcome: null, nueveSentidosSeedCollected: false,
    }));
    const hummingbirdHistory = { ...savedHistory, hummingbirdOutcome: "bad" as const };
    expect(getJourneyHudStats(hummingbirdHistory, "hummingbird", true)).toEqual(createInitialJaguarStats({
      ...hummingbirdHistory, nueveSentidosSeedCollected: false,
    }));
  });

  it("aplica los bonos del Colibrí al final de la escena y reemplaza los de la reescritura", () => {
    const completedFriendship = {
      ...savedHistory,
      hummingbirdOutcome: "good" as const,
      hummingbirdEmpatiaBonus: 10,
      hummingbirdValentiaBonus: 9,
    };
    const beforeAnswer = getJourneyHudStats(completedFriendship, "hummingbird", false);
    expect(beforeAnswer).toEqual(createInitialJaguarStats({
      ...completedFriendship,
      hummingbirdOutcome: null,
      hummingbirdEmpatiaBonus: 0,
      hummingbirdValentiaBonus: 0,
      nueveSentidosSeedCollected: false,
    }));

    const firstResult = getJourneyHudStats(completedFriendship, "hummingbird", true);
    expect(firstResult).toEqual(createInitialJaguarStats({
      ...completedFriendship,
      nueveSentidosSeedCollected: false,
    }));
    expect(getJourneyHudStats(completedFriendship, "hummingbird", true)).toEqual(firstResult);

    const rewrittenNeutral = {
      ...completedFriendship,
      hummingbirdOutcome: "neutral" as const,
      hummingbirdEmpatiaBonus: 0,
      hummingbirdValentiaBonus: 3,
    };
    expect(getJourneyHudStats(rewrittenNeutral, "hummingbird", true)).toEqual(createInitialJaguarStats({
      ...rewrittenNeutral,
      nueveSentidosSeedCollected: false,
    }));
  });

  it("no concede los cuatro de Ingenio de Nueve sentidos por tener su semilla archivada", () => {
    const before = getJourneyHudStats(savedHistory, "nueve-sentidos", false);
    expect(getJourneyHudStats(savedHistory, "nueve-sentidos", true)).toEqual({ ...before, ingenio: before.ingenio + 4 });
    expect(getJourneyHudStats(savedHistory, "nueve-sentidos", false)).toEqual(before);
  });

  it("al saltar directamente a Jaguar reutiliza todas las decisiones vigentes sin exigir repetirlas", () => {
    expect(getJourneyHudStats(savedHistory, "jaguar")).toEqual(createInitialJaguarStats(savedHistory));
    const newHistory = { ...savedHistory, dawnOutcome: "A" as const };
    expect(getJourneyHudStats(newHistory, "jaguar", false, finalSnapshot)).toEqual(createInitialJaguarStats(newHistory));
  });

  it("el snapshot de respuestas solo se aplica dentro del mismo intento de Jaguar", () => {
    expect(getJourneyHudStats(savedHistory, "jaguar", false, finalSnapshot)).toEqual(finalSnapshot.stats);
    expect(getJourneyHudStats(savedHistory, "jaguar", false, null)).toEqual(createInitialJaguarStats(savedHistory));
    expect(getJourneyHudStats(savedHistory, "ruins", false, finalSnapshot)).toEqual({ ...baseStats, cautela: 42 });
  });

  it("no borra ni modifica las decisiones guardadas al proyectar el capítulo", () => {
    const frozenHistory = Object.freeze({ ...savedHistory });
    const original = structuredClone(frozenHistory);
    getJourneyHudStats(frozenHistory, "dawn", false, finalSnapshot);
    getJourneyHudStats(frozenHistory, "river", false);
    expect(frozenHistory).toEqual(original);
    expect(getJourneyStatsHistory(frozenHistory, "jaguar")).toEqual(original);
  });
});
