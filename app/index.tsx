import React, { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Player = { id: string; name: string };

export default function Index() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"SETUP" | "CHOICE">("SETUP");

  const targetPlayer = useMemo(() => {
    return players.find((p) => p.id === targetId) ?? null;
  }, [players, targetId]);

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;

    const exists = players.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return;

    const player: Player = { id: String(Date.now()), name };
    setPlayers((prev) => [...prev, player]);
    setNewName("");

    if (players.length === 0) setTargetId(player.id);
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (id === targetId) setTargetId(null);
  }

  const canStart = players.length >= 2 && targetId !== null;

  if (phase === "SETUP") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.h1}>Knowr</Text>
          <Text style={styles.p}>
            Přidej hráče. Kliknutím na jméno vybereš cílového hráče.
          </Text>

          <View style={styles.row}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Jméno hráče"
              placeholderTextColor="#888"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={addPlayer}
            />
            <Pressable style={styles.btn} onPress={addPlayer}>
              <Text style={styles.btnText}>Přidat</Text>
            </Pressable>
          </View>

          <Text style={styles.h2}>Hráči</Text>

          <FlatList
            data={players}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.muted}>Zatím žádní hráči.</Text>}
            renderItem={({ item }) => {
              const isTarget = item.id === targetId;
              return (
                <View style={styles.playerRow}>
                  <Pressable
                    style={[styles.pill, isTarget && styles.pillActive]}
                    onPress={() => setTargetId(item.id)}
                  >
                    <Text style={styles.pillText}>
                      {item.name}
                      {isTarget ? "  (cílový)" : ""}
                    </Text>
                  </Pressable>

                  <Pressable style={styles.deleteBtn} onPress={() => removePlayer(item.id)}>
                    <Text style={styles.deleteText}>Smazat</Text>
                  </Pressable>
                </View>
              );
            }}
          />

          <View style={styles.footer}>
            <Text style={styles.p}>
              Cílový hráč:{" "}
              <Text style={styles.bold}>
                {targetPlayer ? targetPlayer.name : "nevybrán"}
              </Text>
            </Text>

            <Pressable
              style={[styles.btnBig, !canStart && styles.btnDisabled]}
              onPress={() => canStart && setPhase("CHOICE")}
            >
              <Text style={styles.btnText}>Start</Text>
            </Pressable>

            {!canStart && (
              <Text style={styles.muted}>
                Potřebuješ aspoň 2 hráče a vybraného cílového hráče.
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>Fáze: CHOICE</Text>
        <Text style={styles.p}>
          Teď jen ověřujeme SETUP. Příště přidáme dvojice A/B + tajnou volbu + tipování + body.
        </Text>

        <Pressable style={styles.btnBig} onPress={() => setPhase("SETUP")}>
          <Text style={styles.btnText}>Zpět</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b0b" },
  container: { flex: 1, padding: 16, gap: 12 },

  h1: { color: "white", fontSize: 28, fontWeight: "800" },
  h2: { color: "white", fontSize: 18, fontWeight: "700", marginTop: 8 },
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
});
