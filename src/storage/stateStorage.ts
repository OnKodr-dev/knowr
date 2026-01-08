import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PersistedState, Player } from "../game/types";

/**
 * =========================================
 * STORAGE – ukládání / načítání stavu hry
 * =========================================
 */

/**
 * STORAGE_KEY = klíč pro AsyncStorage.
 * - "knowr" = naše appka
 * - "state" = ukládáme stav
 * - "v1" = verze formátu
 */
export const STORAGE_KEY = "knowr.state.v1";

/**
 * ensureScoresForPlayers:
 * - když máme players, chceme mít jistotu, že scores obsahuje položku pro každého hráče
 * - pokud chybí, doplníme 0
 */
export function ensureScoresForPlayers(
  players: Player[],
  scores: Record<string, number>
) {
  const next = { ...scores };
  for (const p of players) {
    if (next[p.id] === undefined) next[p.id] = 0;
  }
  return next;
}

/**
 * loadPersistedState:
 * - načte JSON ze storage
 * - vrátí PersistedState nebo null, pokud nic uloženého není
 */
export async function loadPersistedState(): Promise<PersistedState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const parsed = JSON.parse(raw) as PersistedState;

  return {
    players: parsed.players ?? [],
    targetId: parsed.targetId ?? null,
    scores: parsed.scores ?? {},
  };
}

/**
 * savePersistedState:
 * - uloží PersistedState do storage
 */
export async function savePersistedState(state: PersistedState): Promise<void> {
  const raw = JSON.stringify(state);
  await AsyncStorage.setItem(STORAGE_KEY, raw);
}
