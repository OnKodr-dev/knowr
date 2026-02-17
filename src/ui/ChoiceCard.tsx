import React from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, Text, View } from "react-native";
import { styles } from "../styles/styles";

/**
 * =========================================
 * CHOICE CARD – jedna volba (A nebo B)
 * =========================================
 *
 * Použití:
 * - PICK screen: cílový hráč vybírá A/B
 * - GUESS screen: tipující hádá A/B
 *
 * Card je klikací (Pressable) a uvnitř má:
 * - obrázek
 * - text (např. "A: Blondýna")
 */

type Props = {
  /**
   * title = text pod obrázkem
   * např. "A: Blondýna"
   */
  title: string;

  /**
   * imageSource = zdroj obrázku pro React Native <Image>
   * U lokálních obrázků to bude require("...")
   */
  imageSource: ImageSourcePropType;

  /**
   * onPress = co se stane po kliknutí
   */
  onPress: () => void;
};

export function ChoiceCard(props: Props) {
  const { title, imageSource, onPress } = props;

  return (
    <Pressable style={styles.choiceBtn} onPress={onPress}>
      <View style={{ gap: 10 }}>
        <Image
          source={imageSource}
          style={{ width: "100%", height: 180, borderRadius: 14 }}
          resizeMode="cover"
        />
        <Text style={styles.choiceText}>{title}</Text>
      </View>
    </Pressable>
  );
}
