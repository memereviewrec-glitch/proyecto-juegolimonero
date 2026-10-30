import { describe, expect, it } from "vitest";
import { mergeDiscoveredSeedIds } from "./gameProgressStorage";

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
