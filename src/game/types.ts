/**
 * =========================================
 * GAME TYPES – sdílené typy pro celou hru
 * =========================================
 */
import type { ImageSourcePropType } from "react-native";

export type Player = { id: string; name: string };

export type OptionKey = "A" | "B";

export type Pair = {
  label: string;
  A: string;
  B: string;

  /**
   * imageA / imageB = zdroje obrázků pro React Native <Image />
   * Typ ImageSourcePropType pokrývá:
   * - require("lokální-soubor")
   * - nebo vzdálený obrázek přes { uri: "..." }
   */
  imageA: ImageSourcePropType;
  imageB: ImageSourcePropType;
};


/**
 * Phase = fáze hry (state machine).
 */
export type Phase = "SETUP" | "PASS_TO_TARGET" | "PICK" | "PASS_TO_GUESSOR" | "GUESS" | "RESULT" | "GAME_OVER";

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
