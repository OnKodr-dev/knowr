import type { Pair } from "./types";

/**
 * =========================================
 * PAIRS – dataset dvojic (A/B)
 * =========================================
 */
export const PAIRS: Pair[] = [
  {
    label: "Co by si vybral/a?",
    A: "Blondýna",
    B: "Černovláska",
    imageA: require("../../assets/pairs/pair1_a.jpeg"),
    imageB: require("../../assets/pairs/pair1_b.jpeg"),
  },
  {
    label: "Radši…",
    A: "Kafe",
    B: "Čaj",
    imageA: require("../../assets/pairs/pair2_a.jpeg"),
    imageB: require("../../assets/pairs/pair2_b.jpeg"),
  },
  {
    label: "Více tě láká…",
    A: "Pláž",
    B: "Hory",
    imageA: require("../../assets/pairs/pair3_a.jpeg"),
    imageB: require("../../assets/pairs/pair3_b.jpeg"),
  },
  {
    label: "Když večer…",
    A: "Film",
    B: "Hra",
    imageA: require("../../assets/pairs/pair4_a.jpeg"),
    imageB: require("../../assets/pairs/pair4_b.jpeg"),
  },
];
