import { describe, expect, it } from "vitest";
import { canOfferFireSeedWatering } from "./fireForestRules";

const completedFire = {
  fireOut: true,
  postFireDialogueDismissed: true,
  riverWaterCollected: true,
  fireSeedWatered: false,
};

describe("acción de regar la semilla en El Fuego", () => {
  it("solo aparece al final del fuego si se ha recogido agua y aún no se ha usado", () => {
    expect(canOfferFireSeedWatering(completedFire)).toBe(true);
    expect(canOfferFireSeedWatering({ ...completedFire, riverWaterCollected: false })).toBe(false);
    expect(canOfferFireSeedWatering({ ...completedFire, fireSeedWatered: true })).toBe(false);
    expect(canOfferFireSeedWatering({ ...completedFire, fireOut: false })).toBe(false);
    expect(canOfferFireSeedWatering({ ...completedFire, postFireDialogueDismissed: false })).toBe(false);
  });
});
