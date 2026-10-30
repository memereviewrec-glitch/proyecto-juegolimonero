export type RamblaOutcomeValue = 1 | 2;

export const SEED_BOOK_STORAGE_KEY = "limonero-fuzz-seedbook-v1";
export const RAMBLA_ROUTE_STORAGE_KEY = "limonero-fuzz-rambla-route-v1";

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

export function readStoredRamblaOutcome(): RamblaOutcomeValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(RAMBLA_ROUTE_STORAGE_KEY);
    return value === "1" || value === "2" ? Number(value) as RamblaOutcomeValue : null;
  } catch {
    return null;
  }
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
    window.localStorage.removeItem(RAMBLA_ROUTE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
