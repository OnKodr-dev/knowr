import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/styles";

/**
 * =========================================
 * RESULT SCREEN – vyhodnocení kola
 * =========================================
 */

type ResultRow = {
  id: string;
  name: string;
  guess: string; // "A" / "B" / "—"
  ok: boolean;
};

type Props = {
  title: string;
  correctLabel: string;
  rows: ResultRow[];

  onNextRound: () => void;
  onBackToSetup: () => void;
};

export function ResultScreen(props: Props) {
  const { title, correctLabel, rows, onNextRound, onBackToSetup } = props;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>Výsledek</Text>

        <View style={styles.card}>
          <Text style={styles.h2}>{title}</Text>

          <Text style={styles.p}>
            Správná volba: <Text style={styles.bold}>{correctLabel}</Text>
          </Text>

          <View style={{ height: 12 }} />

          {rows.map((r) => (
            <View key={r.id} style={styles.resultRow}>
              <Text style={styles.p}>
                {r.name}: <Text style={styles.bold}>{r.guess}</Text>{" "}
                {r.ok ? "✅" : "❌"}
              </Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.btnBig} onPress={onNextRound}>
          <Text style={styles.btnText}>Další kolo</Text>
        </Pressable>

        <Pressable style={styles.btnGhost} onPress={onBackToSetup}>
          <Text style={styles.btnGhostText}>Zpět do setupu</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
