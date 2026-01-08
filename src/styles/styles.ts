import { StyleSheet } from "react-native";

/**
 * =========================================
 * STYLES – společné styly pro celé UI
 * =========================================
 */
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b0b" },
  container: { flex: 1, padding: 16, gap: 12 },

  h1: { color: "white", fontSize: 28, fontWeight: "800" },
  h2: { color: "white", fontSize: 18, fontWeight: "700" },
  p: { color: "#ddd", fontSize: 14, lineHeight: 20 },
  bold: { color: "white", fontWeight: "800" },
  muted: { color: "#888", fontSize: 13 },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#111",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#333",
  },
  btnBig: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "white", fontWeight: "800" },

  btnGhost: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "transparent",
  },
  btnGhostText: { color: "#bbb", fontWeight: "800" },

  playerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
  },
  pillActive: { borderColor: "#fff" },
  pillText: { color: "white", fontWeight: "700" },
  scoreText: { color: "#aaa", marginTop: 6, fontSize: 12 },

  deleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#111",
  },
  deleteText: { color: "#ff6b6b", fontWeight: "800" },

  footer: { marginTop: 10, gap: 6 },

  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#111",
    gap: 10,
  },

  choiceBtn: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2f2f2f",
  },
  choiceText: { color: "white", fontWeight: "800", fontSize: 16 },

  resultRow: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
});
