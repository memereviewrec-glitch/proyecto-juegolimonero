import { createInitialJaguarStats, type JaguarHistory, type JaguarStats } from "./components/jaguarRules";
import type { GameScene } from "./sceneAccessRules";

const SCENE_ORDER: Record<GameScene, number> = {
  room: 0,
  dawn: 1,
  ruins: 2,
  gathering: 3,
  river: 4,
  "river-challenge": 5,
  "el-rio": 6,
  "fire-forest": 7,
  hummingbird: 8,
  "nueve-sentidos": 9,
  jaguar: 10,
};

export type JaguarStatsSnapshot = { history: JaguarHistory; stats: JaguarStats };

/** Project the saved history at this chapter, without deleting later decisions. */
export function getJourneyStatsHistory(history: JaguarHistory, scene: GameScene, currentDecisionResolved = false): JaguarHistory {
  const reached = (decisionScene: GameScene) => (
    SCENE_ORDER[scene] > SCENE_ORDER[decisionScene]
    || (scene === decisionScene && currentDecisionResolved)
  );
  return {
    dawnOutcome: reached("dawn") ? history.dawnOutcome : null,
    ramblaOutcome: reached("gathering") ? history.ramblaOutcome : null,
    riverConversationOutcome: reached("river") ? history.riverConversationOutcome : null,
    riverChallengeOutcome: reached("river-challenge") ? history.riverChallengeOutcome : null,
    hummingbirdOutcome: reached("hummingbird") ? history.hummingbirdOutcome : null,
    hummingbirdEmpatiaBonus: reached("hummingbird") ? history.hummingbirdEmpatiaBonus : 0,
    hummingbirdValentiaBonus: reached("hummingbird") ? history.hummingbirdValentiaBonus : 0,
    nueveSentidosSeedCollected: reached("nueve-sentidos") && Boolean(history.nueveSentidosSeedCollected),
  };
}

export function getJourneyHudStats(
  history: JaguarHistory,
  scene: GameScene,
  currentDecisionResolved = false,
  snapshot: JaguarStatsSnapshot | null = null,
): JaguarStats {
  // Encounter answers belong only to the current Jaguar attempt, never earlier chapters.
  if (scene === "jaguar" && snapshot?.history === history) return snapshot.stats;
  return createInitialJaguarStats(getJourneyStatsHistory(history, scene, currentDecisionResolved));
}
