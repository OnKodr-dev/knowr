import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { OptionKey, Pair } from "../game/types";
import { styles } from "../styles/styles";
import { ChoiceCard } from "../ui/ChoiceCard";

/**
 * =========================================
 * PICK SCREEN – cílový hráč tajně volí A/B
 * =========================================
 */

type Props = {
  targetName: string;
  pair: Pair;
  onPick: (option: OptionKey) => void;
};

export function PickScreen(props: Props) {
  const { targetName, pair, onPick } = props;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>Tajná volba</Text>

        <Text style={styles.p}>
          Telefon má: <Text style={styles.bold}>{targetName}</Text>
        </Text>

        <View style={styles.card}>
          <Text style={styles.h2}>{pair.label}</Text>
          <Text style={styles.muted}>Vyber tajně jednu možnost.</Text>

          <View style={{ height: 12 }} />

          <ChoiceCard
            title={`A: ${pair.A}`}
            imageSource={pair.imageA}
            onPress={() => onPick("A")}
          />

          <ChoiceCard
            title={`B: ${pair.B}`}
            imageSource={pair.imageB}
            onPress={() => onPick("B")}
          />

        </View>

        <Text style={styles.muted}>Tipování začne hned po výběru.</Text>
      </View>
    </SafeAreaView>
  );
}
