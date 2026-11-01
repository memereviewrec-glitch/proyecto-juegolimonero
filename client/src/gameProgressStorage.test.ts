import { afterEach, describe, expect, it, vi } from "vitest";
import { clearStoredGameProgress, HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY, mergeDiscoveredSeedIds, readStoredHummingbirdFriendship, readStoredHummingbirdOutcome, readStoredRiverChallengeOutcome, readStoredRiverConversationOutcome, RIVER_CHALLENGE_OUTCOME_STORAGE_KEY, RIVER_CONVERSATION_OUTCOME_STORAGE_KEY, saveHummingbirdOutcome, saveRiverChallengeOutcome, saveRiverConversationOutcome } from "./gameProgressStorage";

afterEach(() => vi.unstubAllGlobals());

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

describe("readStoredHummingbirdFriendship", () => {
  it("returns false when no browser storage is available", () => {
    expect(readStoredHummingbirdFriendship()).toBe(false);
  });

  it("persists the most recent ending and only keeps friendship for the good ending", () => {
    const values = new Map<string, string>();
    const localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    vi.stubGlobal("window", { localStorage });

    saveHummingbirdOutcome("good");
    expect(values.get(HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY)).toBe("good");
    expect(readStoredHummingbirdOutcome()).toBe("good");
    expect(readStoredHummingbirdFriendship()).toBe(true);

    saveHummingbirdOutcome("neutral");
    expect(readStoredHummingbirdOutcome()).toBe("neutral");
    expect(readStoredHummingbirdFriendship()).toBe(false);

    saveHummingbirdOutcome("bad");
    expect(readStoredHummingbirdOutcome()).toBe("bad");
    expect(readStoredHummingbirdFriendship()).toBe(false);

    expect(clearStoredGameProgress()).toBe(true);
    expect(readStoredHummingbirdFriendship()).toBe(false);
    expect(readStoredHummingbirdOutcome()).toBe(null);
  });

  it("reads a friendship saved by an older version", () => {
    const values = new Map<string, string>([[HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY, "friend"]]);
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => values.get(key) ?? null } });

    expect(readStoredHummingbirdOutcome()).toBe("good");
    expect(readStoredHummingbirdFriendship()).toBe(true);
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

    values.set(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY, '{"route":"unknown","choiceIndex":1}');
    expect(readStoredRiverConversationOutcome()).toBe(null);
    values.set(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY, '{"route":"pacifico","choiceIndex":3}');
    expect(readStoredRiverConversationOutcome()).toBe(null);

    expect(clearStoredGameProgress()).toBe(true);
    expect(readStoredRiverConversationOutcome()).toBe(null);
  });
});
