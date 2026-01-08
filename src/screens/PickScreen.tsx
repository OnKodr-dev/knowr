import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { OptionKey, Pair } from "../game/types";
import { styles } from "../styles/styles";

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

          <Pressable style={styles.choiceBtn} onPress={() => onPick("A")}>
            <Text style={styles.choiceText}>A: {pair.A}</Text>
          </Pressable>

          <Pressable style={styles.choiceBtn} onPress={() => onPick("B")}>
            <Text style={styles.choiceText}>B: {pair.B}</Text>
          </Pressable>
        </View>

        <Text style={styles.muted}>Tipování začne hned po výběru.</Text>
      </View>
    </SafeAreaView>
  );
}
