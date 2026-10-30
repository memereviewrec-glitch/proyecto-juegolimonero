import { describe, expect, it } from "vitest";
import { CAMPFIRE_CENTER, CAMPFIRE_DROP_POINT, CAMPFIRE_STICK_COUNT, canCollectCampfireStick, canPlaceCampfireStick, isLemonNearCampfireCenter } from "./campfireMovementRules";

describe("Rambla campfire carrying rules", () => {
  it("uses exactly three sticks and the shared fire-circle center", () => {
    expect(CAMPFIRE_STICK_COUNT).toBe(3);
    expect(CAMPFIRE_CENTER).toEqual({ x: 50, y: 60 });
    expect(CAMPFIRE_DROP_POINT).toEqual({ x: 50, y: 66 });
    expect(canPlaceCampfireStick(CAMPFIRE_DROP_POINT, false)).toBe(true);
  });

  it("allows a stick to be placed only at the settled center of the fire", () => {
    expect(isLemonNearCampfireCenter({ x: 50, y: 66 })).toBe(true);
    expect(canPlaceCampfireStick({ x: 50, y: 66 }, false)).toBe(true);
    expect(canPlaceCampfireStick({ x: 22, y: 86 }, false)).toBe(false);
    expect(canPlaceCampfireStick({ x: 50, y: 66 }, true)).toBe(false);
  });

  it("requires approaching each stick before collecting it", () => {
    const stick = { x: 17, y: 78 };
    expect(canCollectCampfireStick({ x: 22, y: 86 }, stick, false)).toBe(true);
    expect(canCollectCampfireStick({ x: 50, y: 66 }, stick, false)).toBe(false);
    expect(canCollectCampfireStick(stick, stick, true)).toBe(false);
  });
});
