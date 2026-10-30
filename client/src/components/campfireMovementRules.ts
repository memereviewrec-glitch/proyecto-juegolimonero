export type CampfirePoint = { x: number; y: number };

export const CAMPFIRE_STICK_COUNT = 3;
const CAMPFIRE_WORLD_ASPECT = 986 / 1595;
export const CAMPFIRE_CENTER: CampfirePoint = { x: 50, y: 60 };
export const CAMPFIRE_DROP_POINT: CampfirePoint = { x: 50, y: 66 };
const CAMPFIRE_DELIVERY_RADIUS = 8.3;
const CAMPFIRE_PICKUP_RADIUS = 10;

function distanceInWorldHeightPercent(first: CampfirePoint, second: CampfirePoint) {
  const horizontal = (first.x - second.x) * CAMPFIRE_WORLD_ASPECT;
  const vertical = first.y - second.y;
  return Math.hypot(horizontal, vertical);
}

export function isLemonNearCampfireCenter(point: CampfirePoint) {
  return distanceInWorldHeightPercent(point, CAMPFIRE_CENTER) <= CAMPFIRE_DELIVERY_RADIUS;
}

export function canPlaceCampfireStick(point: CampfirePoint, isWalking: boolean) {
  return !isWalking && isLemonNearCampfireCenter(point);
}

export function canCollectCampfireStick(point: CampfirePoint, stickPoint: CampfirePoint, isWalking: boolean) {
  return !isWalking && distanceInWorldHeightPercent(point, stickPoint) <= CAMPFIRE_PICKUP_RADIUS;
}
