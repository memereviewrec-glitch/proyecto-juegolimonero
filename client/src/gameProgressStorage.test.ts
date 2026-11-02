import { afterEach, describe, expect, it, vi } from "vitest";
import { clearStoredGameProgress, clearStoredRiverConversationOutcome, HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY, JAGUAR_ENDINGS_STORAGE_KEY, mergeDiscoveredSeedIds, readStoredHummingbirdFriendship, readStoredHummingbirdOutcome, readStoredJaguarEndings, readStoredRiverChallengeOutcome, readStoredRiverConversationOutcome, RIVER_CHALLENGE_OUTCOME_STORAGE_KEY, RIVER_CONVERSATION_OUTCOME_STORAGE_KEY, saveHummingbirdOutcome, saveJaguarEnding, saveRiverChallengeOutcome, saveRiverConversationOutcome } from "./gameProgressStorage";
import { DAWN_OUTCOME_STORAGE_KEY, readStoredDawnOutcome, saveDawnOutcome, SEED_BOOK_STORAGE_KEY } from "./gameProgressStorage";
import { createInitialJaguarStats } from "./components/jaguarRules";
import { HUMMINGBIRD_REWARDS_STORAGE_KEY, readStoredHummingbirdRewards } from "./gameProgressStorage";

afterEach(() => vi.unstubAllGlobals());

describe("desenlace guardado del amanecer", () => {
  it("no añade una elección a partidas antiguas o sin almacenamiento de navegador", () => {
    expect(readStoredDawnOutcome()).toBe(null);
    expect(() => saveDawnOutcome("A")).not.toThrow();
    vi.stubGlobal("window", { localStorage: { getItem: () => null } });
    expect(readStoredDawnOutcome()).toBe(null);
  });

  it("conserva la última elección y recalcula su recompensa sin acumular puntos ni borrar semillas", () => {
    const values = new Map<string, string>([[SEED_BOOK_STORAGE_KEY, '["intro","ventana"]']]);
    vi.stubGlobal("window", { localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    } });
    const stats = () => createInitialJaguarStats({
      ramblaOutcome: null, hummingbirdOutcome: null, dawnOutcome: readStoredDawnOutcome(),
    });

    saveDawnOutcome("A");
    expect(values.get(DAWN_OUTCOME_STORAGE_KEY)).toBe("A");
    expect(stats()).toEqual({ cautela: 35, empatia: 35, ingenio: 35, valentia: 42 });
    saveDawnOutcome("A");
    expect(stats().valentia).toBe(42);
    saveDawnOutcome("B");
    expect(readStoredDawnOutcome()).toBe("B");
    expect(stats()).toEqual({ cautela: 42, empatia: 35, ingenio: 35, valentia: 35 });
    expect(values.get(SEED_BOOK_STORAGE_KEY)).toBe('["intro","ventana"]');

    expect(clearStoredGameProgress()).toBe(true);
    expect(readStoredDawnOutcome()).toBe(null);
    expect(stats()).toEqual({ cautela: 35, empatia: 35, ingenio: 35, valentia: 35 });
  });

  it("ignora desenlaces no válidos", () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => "invalid" } });
    expect(readStoredDawnOutcome()).toBe(null);
  });

  it("tolera el almacenamiento bloqueado sin impedir que continúe la sesión", () => {
    const blocked = () => { throw new Error("Storage blocked"); };
    vi.stubGlobal("window", { localStorage: { getItem: blocked, setItem: blocked } });
    expect(readStoredDawnOutcome()).toBe(null);
    expect(() => saveDawnOutcome("B")).not.toThrow();
  });
});

describe("mergeDiscoveredSeedIds", () => {
  const catalog = ["intro", "ventana", "raices", "rambla"] as const;

  it("unites saved and newly discovered IDs in catalog order", () => {
    expect(mergeDiscoveredSeedIds(catalog, ["rambla", "intro"], ["raices", "intro"]))
      .toEqual(["intro", "raices", "rambla"]);
  });

  it("ignores IDs not present in the catalog", () => {
    expect(mergeDiscoveredSeedIds(catalog, ["old-id"], ["ventana"])).toEqual(["ventana"]);
  });
});

describe("archivo de finales del Jaguar", () => {
  it("guarda finales distintos una sola vez y elimina el archivo al reiniciar", () => {
    const values = new Map<string, string>();
    const localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    vi.stubGlobal("window", { localStorage });

    expect(saveJaguarEnding("empatia")).toEqual(["empatia"]);
    expect(saveJaguarEnding("empatia")).toEqual(["empatia"]);
    expect(saveJaguarEnding("pesadilla")).toEqual(["empatia", "pesadilla"]);
    expect(readStoredJaguarEndings()).toEqual(["empatia", "pesadilla"]);
    expect(values.get(JAGUAR_ENDINGS_STORAGE_KEY)).toBe('["empatia","pesadilla"]');
    expect(clearStoredGameProgress()).toBe(true);
    expect(readStoredJaguarEndings()).toEqual([]);
  });

  it("filtra identificadores de finales desconocidos o almacenamiento inválido", () => {
    const values = new Map<string, string>([[JAGUAR_ENDINGS_STORAGE_KEY, '["valentia","unknown","valentia"]']]);
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => values.get(key) ?? null } });
    expect(readStoredJaguarEndings()).toEqual(["valentia"]);
    values.set(JAGUAR_ENDINGS_STORAGE_KEY, "not-json");
    expect(readStoredJaguarEndings()).toEqual([]);
  });
});

describe("readStoredHummingbirdFriendship", () => {
  it("returns false when no browser storage is available", () => {
    expect(readStoredHummingbirdFriendship()).toBe(false);
    expect(readStoredHummingbirdRewards()).toEqual({ empatia: 0, valentia: 0 });
  });

  it("persists the most recent ending and only keeps friendship for the good ending", () => {
    const values = new Map<string, string>();
    const localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    vi.stubGlobal("window", { localStorage });

    saveHummingbirdOutcome("good", 4);
    expect(values.get(HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY)).toBe("good");
    expect(values.get(HUMMINGBIRD_REWARDS_STORAGE_KEY)).toBe('{"empatia":10,"valentia":12}');
    expect(readStoredHummingbirdOutcome()).toBe("good");
    expect(readStoredHummingbirdFriendship()).toBe(true);
    expect(readStoredHummingbirdRewards()).toEqual({ empatia: 10, valentia: 12 });

    saveHummingbirdOutcome("neutral", 2);
    expect(readStoredHummingbirdOutcome()).toBe("neutral");
    expect(readStoredHummingbirdFriendship()).toBe(false);
    expect(readStoredHummingbirdRewards()).toEqual({ empatia: 0, valentia: 6 });

    saveHummingbirdOutcome("bad");
    expect(readStoredHummingbirdOutcome()).toBe("bad");
    expect(readStoredHummingbirdFriendship()).toBe(false);
    expect(readStoredHummingbirdRewards()).toEqual({ empatia: 0, valentia: 0 });

    expect(clearStoredGameProgress()).toBe(true);
    expect(readStoredHummingbirdFriendship()).toBe(false);
    expect(readStoredHummingbirdOutcome()).toBe(null);
    expect(readStoredHummingbirdRewards()).toEqual({ empatia: 0, valentia: 0 });
  });

  it("reads a friendship saved by an older version", () => {
    const values = new Map<string, string>([[HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY, "friend"]]);
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => values.get(key) ?? null } });

    expect(readStoredHummingbirdOutcome()).toBe("good");
    expect(readStoredHummingbirdFriendship()).toBe(true);
    expect(readStoredHummingbirdRewards()).toEqual({ empatia: 10, valentia: 0 });
  });

  it("persists the river challenge choice and removes it when progress is cleared", () => {
    const values = new Map<string, string>();
    const localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    vi.stubGlobal("window", { localStorage });

    saveRiverChallengeOutcome("current");
    expect(values.get(RIVER_CHALLENGE_OUTCOME_STORAGE_KEY)).toBe("current");
    expect(readStoredRiverChallengeOutcome()).toBe("current");

    values.set(RIVER_CHALLENGE_OUTCOME_STORAGE_KEY, "invalid");
    expect(readStoredRiverChallengeOutcome()).toBe(null);

    saveRiverChallengeOutcome("shore");
    expect(readStoredRiverChallengeOutcome()).toBe("shore");
    expect(clearStoredGameProgress()).toBe(true);
    expect(readStoredRiverChallengeOutcome()).toBe(null);
  });

  it("persists the first river conversation route and answer, validates them, and clears them on restart", () => {
    const values = new Map<string, string>();
    const localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    vi.stubGlobal("window", { localStorage });

    saveRiverConversationOutcome({ route: "drastico", choiceIndex: 2 });
    expect(values.get(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY)).toBe('{"route":"drastico","choiceIndex":2}');
    expect(readStoredRiverConversationOutcome()).toEqual({ route: "drastico", choiceIndex: 2 });

    clearStoredRiverConversationOutcome();
    expect(readStoredRiverConversationOutcome()).toBe(null);
    saveRiverConversationOutcome({ route: "drastico", choiceIndex: 2 });

    values.set(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY, '{"route":"unknown","choiceIndex":1}');
    expect(readStoredRiverConversationOutcome()).toBe(null);
    values.set(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY, '{"route":"pacifico","choiceIndex":3}');
    expect(readStoredRiverConversationOutcome()).toBe(null);

    expect(clearStoredGameProgress()).toBe(true);
    expect(readStoredRiverConversationOutcome()).toBe(null);
  });
});
