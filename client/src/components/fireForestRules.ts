export type FireWateringState = {
  fireOut: boolean;
  postFireDialogueDismissed: boolean;
  riverWaterCollected: boolean;
  fireSeedWatered: boolean;
};

export function canOfferFireSeedWatering(state: FireWateringState): boolean {
  return state.fireOut
    && state.postFireDialogueDismissed
    && state.riverWaterCollected
    && !state.fireSeedWatered;
}
