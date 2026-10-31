import { afterEach, describe, expect, it, vi } from "vitest";
import { clearStoredGameProgress, HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY, mergeDiscoveredSeedIds, readStoredHummingbirdFriendship, saveHummingbirdFriendship } from "./gameProgressStorage";

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

  it("persists the friendship and clears it with the game's progress", () => {
    const values = new Map<string, string>();
    const localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    vi.stubGlobal("window", { localStorage });

    saveHummingbirdFriendship();
    expect(values.get(HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY)).toBe("friend");
    expect(readStoredHummingbirdFriendship()).toBe(true);

    expect(clearStoredGameProgress()).toBe(true);
    expect(readStoredHummingbirdFriendship()).toBe(false);
  });
});
