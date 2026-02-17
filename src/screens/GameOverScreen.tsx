import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/styles";

/**
 * =========================================
 * GAME OVER SCREEN – konečné výsledky
 * =========================================
 *
 * Cíl:
 * - vypsat skóre všech hráčů (seřazené od nejvyššího)
 * - dát možnost začít novou hru (reset skóre + zpět do setupu)
 */

type ScoreRow = {
  id: string;
  name: string;
  score: number;
};

type Props = {
  rows: ScoreRow[];
  onNewGame: () => void;
};

export function GameOverScreen(props: Props) {
  const { rows, onNewGame } = props;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>Konec hry</Text>
        <Text style={styles.muted}>Finální pořadí:</Text>

        <View style={styles.card}>
          {rows.map((r, index) => (
            <View key={r.id} style={styles.resultRow}>
              <Text style={styles.p}>
                <Text style={styles.bold}>
                  {index + 1}. {r.name}
                </Text>{" "}
                — {r.score}
              </Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.btnBig} onPress={onNewGame}>
          <Text style={styles.btnText}>Nová hra</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
