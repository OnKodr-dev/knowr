import React from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Player } from "../game/types";
import { styles } from "../styles/styles";

/**
 * =========================================
 * SETUP SCREEN – přidávání hráčů + výběr targeta
 * =========================================
 */

type Props = {
  players: Player[];
  scores: Record<string, number>;
  targetId: string | null;

  newName: string;
  onChangeNewName: (value: string) => void;

  onAddPlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onSelectTarget: (id: string) => void;

  targetPlayerName: string | null;

  canStart: boolean;
  onStartGame: () => void;

  hydrated: boolean;

  onResetScores: () => void;
};

export function SetupScreen(props: Props) {
  const {
    players,
    scores,
    targetId,
    newName,
    onChangeNewName,
    onAddPlayer,
    onRemovePlayer,
    onSelectTarget,
    targetPlayerName,
    canStart,
    onStartGame,
    hydrated,
    onResetScores,
  } = props;

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
            onChangeText={onChangeNewName}
            placeholder="Jméno hráče"
            placeholderTextColor="#888"
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={onAddPlayer}
          />
          <Pressable style={styles.btn} onPress={onAddPlayer}>
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
                  onPress={() => onSelectTarget(item.id)}
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
                  onPress={() => onRemovePlayer(item.id)}
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
              {targetPlayerName ? targetPlayerName : "nevybrán"}
            </Text>
          </Text>

          <Pressable
            style={[styles.btnBig, !canStart && styles.btnDisabled]}
            onPress={onStartGame}
          >
            <Text style={styles.btnText}>Start</Text>
          </Pressable>

          <Pressable style={styles.btnGhost} onPress={onResetScores}>
            <Text style={styles.btnGhostText}>Reset Skóre</Text>
          </Pressable>

          {!canStart && (
            <Text style={styles.muted}>
              Potřebuješ aspoň 2 hráče a vybraného cílového hráče.
            </Text>
          )}

          {!hydrated && <Text style={styles.muted}>Načítám uložený stav…</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
}
