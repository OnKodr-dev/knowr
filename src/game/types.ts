/**
 * =========================================
 * GAME TYPES – sdílené typy pro celou hru
 * =========================================
 */

export type Player = { id: string; name: string };

export type OptionKey = "A" | "B";

export type Pair = {
  label: string;
  A: string;
  B: string;
};

export type Phase = "SETUP" | "PICK" | "GUESS" | "RESULT";

/**
 * PersistedState = přesně to, co ukládáme do AsyncStorage.
 * Ukládáme jen dlouhodobý “profil hry”:
 * - hráči
 * - cílový hráč
 * - skóre
 */
export type PersistedState = {
  players: Player[];
  targetId: string | null;
  scores: Record<string, number>;
};
