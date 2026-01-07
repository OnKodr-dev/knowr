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

/**
 * =========================================
 * 1) “DATA MODEL” – typy a otázky (A/B)
 * =========================================
 */

/**
 * Player = jeden hráč.
 * id: unikátní identifikátor (string)
 * name: zobrazované jméno
 */
type Player = { id: string; name: string };

/**
 * OptionKey = klíč volby. Držíme to jako "A" | "B", aby:
 * - bylo jasné, že existují jen dvě možnosti
 * - TypeScript hlídal chyby (neprojde třeba "C")
 */
type OptionKey = "A" | "B";

/**
 * Pair = jedna “otázka” / “dvojice”.
 * label: text nahoře (co vlastně vybíráme)
 * A/B: texty možností (zatím jen text, později můžeme dát image url)
 */
type Pair = {
  label: string;
  A: string;
  B: string;
};

/**
 * To je náš první “dataset” dvojic.
 * Pro MVP jich stačí pár. Později to rozšíříme a nahradíme obrázky.
 */
const PAIRS: Pair[] = [
  { label: "Co by si vybral/a?", A: "Blondýna", B: "Černovláska" },
  { label: "Radši…", A: "Kafe", B: "Čaj" },
  { label: "Více tě láká…", A: "Pláž", B: "Hory" },
  { label: "Když večer…", A: "Film", B: "Hra" },
];

/**
 * Phase = fáze hry.
 * SETUP  … přidávání hráčů
 * PICK   … cílový hráč tajně vybírá A/B
 * GUESS  … ostatní hádají A/B (po jednom)
 * RESULT … vyhodnocení + body
 */
type Phase = "SETUP" | "PICK" | "GUESS" | "RESULT";

export default function Index() {
  /**
   * =========================================
   * 2) SETUP STATE – hráči + cílový hráč
   * =========================================
   */

  // seznam hráčů
  const [players, setPlayers] = useState<Player[]>([]);
  // text v inputu při přidávání hráče
  const [newName, setNewName] = useState("");
  // id cílového hráče (ten tajně vybírá)
  const [targetId, setTargetId] = useState<string | null>(null);

  /**
   * =========================================
   * 3) GAME STATE – co je potřeba pro hru
   * =========================================
   */

  // aktuální fáze hry
  const [phase, setPhase] = useState<Phase>("SETUP");

  // index aktuální dvojice (PAIRS[pairIndex])
  const [pairIndex, setPairIndex] = useState(0);

  // co cílový hráč vybral (A/B) – tajná odpověď pro kolo
  const [picked, setPicked] = useState<OptionKey | null>(null);

  /**
   * guesses = objekt (mapa), kde klíč je playerId tipujícího
   * a hodnota je jeho tip ("A" nebo "B")
   *
   * Příklad:
   * { "idPetry": "A", "idKuby": "B" }
   */
  const [guesses, setGuesses] = useState<Record<string, OptionKey>>({});

  /**
   * scores = skóre hráčů.
   * Příklad:
   * { "idPetry": 2, "idKuby": 1, "idTarget": 0 }
   */
  const [scores, setScores] = useState<Record<string, number>>({});

  // který tipující je právě na řadě (index do pole guesserIds)
  const [guesserCursor, setGuesserCursor] = useState(0);

  /**
   * =========================================
   * 4) DERIVED VALUES – věci spočítané ze state
   * =========================================
   */

  // cílový hráč objekt (ne jen id)
  const targetPlayer = useMemo(() => {
    return players.find((p) => p.id === targetId) ?? null;
  }, [players, targetId]);

  // aktuální dvojice (otázka)
  const currentPair = PAIRS[pairIndex];

  /**
   * guesserIds = všichni hráči kromě targeta.
   * To jsou lidé, co budou tipovat.
   */
  const guesserIds = useMemo(() => {
    if (!targetId) return [];
    return players.filter((p) => p.id !== targetId).map((p) => p.id);
  }, [players, targetId]);

  // aktuální tipující hráč (na řadě)
  const currentGuesser = useMemo(() => {
    const id = guesserIds[guesserCursor];
    return players.find((p) => p.id === id) ?? null;
  }, [players, guesserIds, guesserCursor]);

  // jednoduchá podmínka: kdy lze hru spustit
  const canStart = players.length >= 2 && targetId !== null;

  /**
   * =========================================
   * 5) SETUP FUNCTIONS – přidávání/mazání hráčů
   * =========================================
   */

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;

    // duplicita (case-insensitive)
    const exists = players.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return;

    const player: Player = { id: String(Date.now()), name };

    // immutable update: vytvoříme nové pole
    setPlayers((prev) => [...prev, player]);
    setNewName("");

    // když je to první hráč, nastav ho jako target
    if (players.length === 0) setTargetId(player.id);

    // init skóre hráče (pokud ještě není)
    setScores((prev) => {
      if (prev[player.id] !== undefined) return prev;
      return { ...prev, [player.id]: 0 };
    });
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));

    // smažeš-li cílového, zruš target
    if (id === targetId) setTargetId(null);

    // vyhoď jeho tipy/skóre (pro MVP ok)
    setGuesses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setScores((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  /**
   * =========================================
   * 6) GAME FLOW FUNCTIONS – start, pick, guess, result
   * =========================================
   */

  function startGame() {
    if (!canStart) return;

    // připrav nové kolo
    setPairIndex(0);
    setPicked(null);
    setGuesses({});
    setGuesserCursor(0);

    // jdeme do fáze tajné volby cílového hráče
    setPhase("PICK");
  }

  function pickOption(option: OptionKey) {
    // cílový hráč zvolil A/B
    setPicked(option);

    // přepneme do tipování
    setGuesses({});
    setGuesserCursor(0);
    setPhase("GUESS");
  }

  function submitGuess(option: OptionKey) {
    if (!currentGuesser) return;

    // uložíme tip aktuálního tipujícího
    setGuesses((prev) => ({
      ...prev,
      [currentGuesser.id]: option,
    }));

    const nextCursor = guesserCursor + 1;

    // pokud existuje další tipující, posuneme cursor
    if (nextCursor < guesserIds.length) {
      setGuesserCursor(nextCursor);
      return;
    }

    // když byli všichni hotoví, jdeme vyhodnotit
    setPhase("RESULT");
  }

  function applyScoresAndNextRound() {
    if (!picked || !targetId) return;

    /**
     * Vyhodnocení bodů:
     * každý tipující, kdo se trefil, dostane +1.
     */
    setScores((prev) => {
      const next = { ...prev };

      for (const gid of guesserIds) {
        const g = guesses[gid]; // tip daného hráče
        if (g && g === picked) {
          next[gid] = (next[gid] ?? 0) + 1;
        } else {
          next[gid] = next[gid] ?? 0;
        }
      }

      // targetovi skóre neměníme (zatím)
      next[targetId] = next[targetId] ?? 0;

      return next;
    });

    // další dvojice (cyklicky)
    setPairIndex((prev) => (prev + 1) % PAIRS.length);

    // reset kola
    setPicked(null);
    setGuesses({});
    setGuesserCursor(0);

    // zpátky na tajnou volbu
    setPhase("PICK");
  }

  /**
   * =========================================
   * 7) UI – render podle phase
   * =========================================
   */

  // ---------- SETUP ----------
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
            ListEmptyComponent={
              <Text style={styles.muted}>Zatím žádní hráči.</Text>
            }
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
                    <Text style={styles.scoreText}>
                      Skóre: {scores[item.id] ?? 0}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => removePlayer(item.id)}
                  >
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
              onPress={startGame}
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

  // ---------- PICK ----------
  if (phase === "PICK") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.h1}>Tajná volba</Text>
          <Text style={styles.p}>
            Telefon má:{" "}
            <Text style={styles.bold}>{targetPlayer?.name ?? "?"}</Text>
          </Text>

          <View style={styles.card}>
            <Text style={styles.h2}>{currentPair.label}</Text>
            <Text style={styles.muted}>Vyber tajně jednu možnost.</Text>

            <View style={{ height: 12 }} />

            <Pressable style={styles.choiceBtn} onPress={() => pickOption("A")}>
              <Text style={styles.choiceText}>A: {currentPair.A}</Text>
            </Pressable>

            <Pressable style={styles.choiceBtn} onPress={() => pickOption("B")}>
              <Text style={styles.choiceText}>B: {currentPair.B}</Text>
            </Pressable>
          </View>

          <Text style={styles.muted}>
            Tipování začne hned po výběru.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- GUESS ----------
  if (phase === "GUESS") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.h1}>Tipování</Text>

          <Text style={styles.p}>
            Na řadě je:{" "}
            <Text style={styles.bold}>{currentGuesser?.name ?? "?"}</Text>
          </Text>

          <View style={styles.card}>
            <Text style={styles.h2}>{currentPair.label}</Text>
            <Text style={styles.muted}>
              Tipni, co vybral/a {targetPlayer?.name ?? "cílový hráč"}:
            </Text>

            <View style={{ height: 12 }} />

            <Pressable style={styles.choiceBtn} onPress={() => submitGuess("A")}>
              <Text style={styles.choiceText}>A: {currentPair.A}</Text>
            </Pressable>

            <Pressable style={styles.choiceBtn} onPress={() => submitGuess("B")}>
              <Text style={styles.choiceText}>B: {currentPair.B}</Text>
            </Pressable>
          </View>

          <Text style={styles.muted}>
            {guesserCursor + 1} / {guesserIds.length} tipujících hotovo
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- RESULT ----------
  // (phase === "RESULT")
  const pickedLabel =
    picked === "A" ? `A: ${currentPair.A}` : picked === "B" ? `B: ${currentPair.B}` : "?";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>Výsledek</Text>

        <View style={styles.card}>
          <Text style={styles.h2}>{currentPair.label}</Text>
          <Text style={styles.p}>
            Správná volba: <Text style={styles.bold}>{pickedLabel}</Text>
          </Text>

          <View style={{ height: 12 }} />

          {guesserIds.map((gid) => {
            const p = players.find((x) => x.id === gid);
            const g = guesses[gid];
            const ok = picked && g === picked;

            return (
              <View key={gid} style={styles.resultRow}>
                <Text style={styles.p}>
                  {p?.name ?? "?"}:{" "}
                  <Text style={styles.bold}>
                    {g ? g : "—"}
                  </Text>{" "}
                  {ok ? "✅" : "❌"}
                </Text>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.btnBig} onPress={applyScoresAndNextRound}>
          <Text style={styles.btnText}>Další kolo</Text>
        </Pressable>

        <Pressable style={styles.btnGhost} onPress={() => setPhase("SETUP")}>
          <Text style={styles.btnGhostText}>Zpět do setupu</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/**
 * =========================================
 * 8) STYLES – RN StyleSheet (není CSS)
 * =========================================
 */
const styles = StyleSheet.create({
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
