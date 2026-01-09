import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/styles";

/**
 * =========================================
 * PASS SCREEN – obrazovka pro předání telefonu
 * =========================================
 *
 * Cíl:
 * - zobrazit, komu se má telefon předat
 * - až když hráč klikne na tlačítko, pokračujeme dál
 *
 * Je to univerzální komponenta:
 * - může sloužit před PICK (cílový hráč)
 * - i před GUESS (tipující hráč)
 */

type Props = {
  /**
   * title = hlavní nadpis obrazovky
   * Např. "Předání telefonu"
   */
  title: string;

  /**
   * instruction = krátký text, co se má stát
   * Např. "Telefon vezme:"
   */
  instruction: string;

  /**
   * playerName = jméno hráče, kterému telefon předáváme
   */
  playerName: string;

  /**
   * buttonText = text tlačítka
   * Např. "Jsem připraven"
   */
  buttonText: string;

  /**
   * onContinue = callback, který zavoláme po kliknutí na tlačítko
   */
  onContinue: () => void;
};

export function PassScreen(props: Props) {
  const { title, instruction, playerName, buttonText, onContinue } = props;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>{title}</Text>

        <View style={styles.card}>
          <Text style={styles.p}>{instruction}</Text>

          {/* playerName zvýrazníme jako “bold” */}
          <Text style={styles.h2}>{playerName}</Text>

          <Text style={styles.muted}>
            Ujisti se, že se nikdo nedívá na obrazovku.
          </Text>
        </View>

        <Pressable style={styles.btnBig} onPress={onContinue}>
          <Text style={styles.btnText}>{buttonText}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
