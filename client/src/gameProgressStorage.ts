import type { RiverConversationOutcome } from "./components/riverChoiceRules";
import { getHummingbirdRewards, type HummingbirdOutcome, type HummingbirdRewards } from "./components/hummingbirdRules";
import type { JaguarEndingId } from "./components/storyArchive";
import type { Branch } from "./gameRules";

export type RamblaOutcomeValue = 1 | 2;
export type HummingbirdOutcomeValue = HummingbirdOutcome;
export type RiverChallengeOutcomeValue = "current" | "shore";

export const SEED_BOOK_STORAGE_KEY = "limonero-fuzz-seedbook-v1";
export const DAWN_OUTCOME_STORAGE_KEY = "limonero-fuzz-dawn-outcome-v1";
export const RAMBLA_ROUTE_STORAGE_KEY = "limonero-fuzz-rambla-route-v1";
export const HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY = "limonero-fuzz-hummingbird-friendship-v1";
export const HUMMINGBIRD_REWARDS_STORAGE_KEY = "limonero-fuzz-hummingbird-rewards-v1";
export const RIVER_CHALLENGE_OUTCOME_STORAGE_KEY = "limonero-fuzz-river-challenge-outcome-v1";
export const RIVER_CONVERSATION_OUTCOME_STORAGE_KEY = "limonero-fuzz-river-conversation-outcome-v1";
export const JAGUAR_ENDINGS_STORAGE_KEY = "limonero-fuzz-jaguar-endings-v1";
const VALID_JAGUAR_ENDINGS = new Set<JaguarEndingId>(["empatia", "enigmas", "valentia", "pesadilla"]);

export function readStoredSeedBookIds<Id extends string>(knownIds: readonly Id[]): Id[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(SEED_BOOK_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const known = new Set<string>(knownIds);
    return [...new Set(parsed.filter((id): id is Id => typeof id === "string" && known.has(id)))];
  } catch {
    return [];
  }
}

export function readStoredDawnOutcome(): Branch | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(DAWN_OUTCOME_STORAGE_KEY);
    return value === "A" || value === "B" ? value : null;
  } catch {
    return null;
  }
}

export function saveDawnOutcome(outcome: Branch) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DAWN_OUTCOME_STORAGE_KEY, outcome);
  } catch {
    // El desenlace sigue disponible durante la sesión aunque el almacenamiento esté bloqueado.
  }
}

export function readStoredRamblaOutcome(): RamblaOutcomeValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(RAMBLA_ROUTE_STORAGE_KEY);
    return value === "1" || value === "2" ? Number(value) as RamblaOutcomeValue : null;
  } catch {
    return null;
  }
}

export function readStoredHummingbirdOutcome(): HummingbirdOutcomeValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY);
    if (value === "friend") return "good";
    return value === "good" || value === "bad" || value === "neutral" ? value : null;
  } catch {
    return null;
  }
}

export function readStoredHummingbirdFriendship(): boolean {
  return readStoredHummingbirdOutcome() === "good";
}

export function readStoredHummingbirdRewards(): HummingbirdRewards {
  if (typeof window === "undefined") return { empatia: 0, valentia: 0 };
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(HUMMINGBIRD_REWARDS_STORAGE_KEY) ?? "null");
    if (typeof parsed === "object" && parsed !== null) {
      const { empatia, valentia } = parsed as Record<string, unknown>;
      if ((empatia === 0 || empatia === 10) && Number.isInteger(valentia) && Number(valentia) >= 0 && Number(valentia) <= 18 && Number(valentia) % 3 === 0) {
        return { empatia, valentia: Number(valentia) };
      }
    }
  } catch {
    // Si el formato nuevo falta o está dañado, se migra desde el desenlace anterior.
  }
  return getHummingbirdRewards(readStoredHummingbirdOutcome() ?? "neutral", 0);
}

export function readStoredRiverChallengeOutcome(): RiverChallengeOutcomeValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(RIVER_CHALLENGE_OUTCOME_STORAGE_KEY);
    return value === "current" || value === "shore" ? value : null;
  } catch {
    return null;
  }
}

export function readStoredRiverConversationOutcome(): RiverConversationOutcome | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY) ?? "null");
    if (typeof parsed !== "object" || parsed === null) return null;
    const { route, choiceIndex } = parsed as Record<string, unknown>;
    if ((route !== "pacifico" && route !== "drastico") || !Number.isInteger(choiceIndex) || Number(choiceIndex) < 0 || Number(choiceIndex) > 2) return null;
    return { route, choiceIndex: Number(choiceIndex) };
  } catch {
    return null;
  }
}

export function saveHummingbirdOutcome(outcome: HummingbirdOutcomeValue, valiantResponseCount = 0): HummingbirdRewards {
  const rewards = getHummingbirdRewards(outcome, valiantResponseCount);
  if (typeof window === "undefined") return rewards;
  try {
    window.localStorage.setItem(HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY, outcome);
    window.localStorage.setItem(HUMMINGBIRD_REWARDS_STORAGE_KEY, JSON.stringify(rewards));
  } catch {
    // El desenlace sigue disponible durante la sesión aunque el almacenamiento esté bloqueado.
  }
  return rewards;
}

export function saveRiverChallengeOutcome(outcome: RiverChallengeOutcomeValue) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RIVER_CHALLENGE_OUTCOME_STORAGE_KEY, outcome);
  } catch {
    // El desenlace sigue disponible durante la sesión aunque el almacenamiento esté bloqueado.
  }
}

export function saveRiverConversationOutcome(outcome: RiverConversationOutcome) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY, JSON.stringify(outcome));
  } catch {
    // La elección sigue disponible durante la sesión aunque el almacenamiento esté bloqueado.
  }
}

export function readStoredJaguarEndings(): JaguarEndingId[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(JAGUAR_ENDINGS_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((ending): ending is JaguarEndingId => typeof ending === "string" && VALID_JAGUAR_ENDINGS.has(ending as JaguarEndingId)))];
  } catch {
    return [];
  }
}

export function saveJaguarEnding(ending: JaguarEndingId): JaguarEndingId[] {
  const endings = [...new Set([...readStoredJaguarEndings(), ending])];
  if (typeof window === "undefined") return endings;
  try {
    window.localStorage.setItem(JAGUAR_ENDINGS_STORAGE_KEY, JSON.stringify(endings));
  } catch {
    // El archivo sigue disponible durante la sesión si el almacenamiento está bloqueado.
  }
  return endings;
}

export function mergeDiscoveredSeedIds<Id extends string>(catalogIds: readonly Id[], persistedIds: readonly string[], discoveredIds: readonly string[]): Id[] {
  const found = new Set([...persistedIds, ...discoveredIds]);
  return catalogIds.filter(id => found.has(id));
}

export function saveSeedBookIds(ids: readonly string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEED_BOOK_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // La colección sigue disponible durante la sesión si el almacenamiento local está bloqueado.
  }
}

export function clearStoredRiverConversationOutcome() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY);
  } catch {
    // El nuevo desenlace se conserva en memoria aunque el almacenamiento esté bloqueado.
  }
}

export function saveRamblaOutcome(outcome: RamblaOutcomeValue) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RAMBLA_ROUTE_STORAGE_KEY, String(outcome));
  } catch {
    // La ruta sigue disponible durante la sesión si el almacenamiento está bloqueado.
  }
}

export function clearStoredGameProgress(): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(SEED_BOOK_STORAGE_KEY);
    window.localStorage.removeItem(DAWN_OUTCOME_STORAGE_KEY);
    window.localStorage.removeItem(RAMBLA_ROUTE_STORAGE_KEY);
    window.localStorage.removeItem(HUMMINGBIRD_FRIENDSHIP_STORAGE_KEY);
    window.localStorage.removeItem(HUMMINGBIRD_REWARDS_STORAGE_KEY);
    window.localStorage.removeItem(RIVER_CHALLENGE_OUTCOME_STORAGE_KEY);
    window.localStorage.removeItem(RIVER_CONVERSATION_OUTCOME_STORAGE_KEY);
    window.localStorage.removeItem(JAGUAR_ENDINGS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
