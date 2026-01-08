import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { OptionKey, Pair } from "../game/types";
import { styles } from "../styles/styles";

/**
 * =========================================
 * GUESS SCREEN – každý tipující hádá A/B
 * =========================================
 */

type Props = {
  guesserName: string;
  targetName: string;
  pair: Pair;

  progressText: string;

  onGuess: (option: OptionKey) => void;
};

export function GuessScreen(props: Props) {
  const { guesserName, targetName, pair, progressText, onGuess } = props;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>Tipování</Text>

        <Text style={styles.p}>
          Na řadě je: <Text style={styles.bold}>{guesserName}</Text>
        </Text>

        <View style={styles.card}>
          <Text style={styles.h2}>{pair.label}</Text>

          <Text style={styles.muted}>
            Tipni, co vybral/a {targetName}:
          </Text>

          <View style={{ height: 12 }} />

          <Pressable style={styles.choiceBtn} onPress={() => onGuess("A")}>
            <Text style={styles.choiceText}>A: {pair.A}</Text>
          </Pressable>

          <Pressable style={styles.choiceBtn} onPress={() => onGuess("B")}>
            <Text style={styles.choiceText}>B: {pair.B}</Text>
          </Pressable>
        </View>

        <Text style={styles.muted}>{progressText}</Text>
      </View>
    </SafeAreaView>
  );
}
