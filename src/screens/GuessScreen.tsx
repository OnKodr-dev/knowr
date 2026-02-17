import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { OptionKey, Pair } from "../game/types";
import { styles } from "../styles/styles";
import { ChoiceCard } from "../ui/ChoiceCard";

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

          <ChoiceCard
            title={`A: ${pair.A}`}
            imageSource={pair.imageA}
            onPress={() => onGuess("A")}
            />

            <ChoiceCard
            title={`B: ${pair.B}`}
            imageSource={pair.imageB}
            onPress={() => onGuess("B")}
            />


        </View>

        <Text style={styles.muted}>{progressText}</Text>
      </View>
    </SafeAreaView>
  );
}
