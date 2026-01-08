import React, { useEffect, useMemo, useState } from "react";
import { PAIRS } from "../src/game/pairs";
import type { OptionKey, Phase, Player } from "../src/game/types";
import { GuessScreen } from "../src/screens/GuessScreen";
import { PickScreen } from "../src/screens/PickScreen";
import { ResultScreen } from "../src/screens/ResultScreen";
import { SetupScreen } from "../src/screens/SetupScreen";
import {
    ensureScoresForPlayers,
    loadPersistedState,
    savePersistedState,
} from "../src/storage/stateStorage";

/**
 * =========================================
 * INDEX (ROUTE) – “mozek” aplikace
 * =========================================
 * - drží state + logiku
 * - renderuje jednu ze 4 obrazovek (screens)
 */

export default function Index() {
  /**
   * =========================================
   * 1) SETUP STATE – hráči + cílový hráč
   * =========================================
   */

  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);

  /**
   * =========================================
   * 2) GAME STATE – průběh hry
   * =========================================
   */

  const [phase, setPhase] = useState<Phase>("SETUP");
  const [pairIndex, setPairIndex] = useState(0);
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [guesses, setGuesses] = useState<Record<string, OptionKey>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [guesserCursor, setGuesserCursor] = useState(0);

  /**
   * hydrated = “už jsme načetli uložený stav ze storage?”
   */
  const [hydrated, setHydrated] = useState(false);

  /**
   * =========================================
   * 3) DERIVED VALUES – spočítané hodnoty ze state
   * =========================================
   */

  const targetPlayer = useMemo(() => {
    return players.find((p) => p.id === targetId) ?? null;
  }, [players, targetId]);

  const targetPlayerName = targetPlayer ? targetPlayer.name : null;

  const currentPair = PAIRS[pairIndex];

  const guesserIds = useMemo(() => {
    if (!targetId) return [];
    return players.filter((p) => p.id !== targetId).map((p) => p.id);
  }, [players, targetId]);

  const currentGuesser = useMemo(() => {
    const id = guesserIds[guesserCursor];
    return players.find((p) => p.id === id) ?? null;
  }, [players, guesserIds, guesserCursor]);

  const currentGuesserName = currentGuesser ? currentGuesser.name : "?";

  const canStart = players.length >= 2 && targetId !== null;

  /**
   * =========================================
   * 4) PERSISTENCE – LOAD při startu + SAVE při změnách
   * =========================================
   */

  useEffect(() => {
    async function load() {
      try {
        const stored = await loadPersistedState();

        if (!stored) {
          setHydrated(true);
          return;
        }

        const loadedPlayers = stored.players ?? [];
        const loadedTargetId = stored.targetId ?? null;
        const loadedScores = ensureScoresForPlayers(
          loadedPlayers,
          stored.scores ?? {}
        );

        setPlayers(loadedPlayers);
        setTargetId(loadedTargetId);
        setScores(loadedScores);

        // bezpečný start: reset kola
        setPhase("SETUP");
        setPairIndex(0);
        setPicked(null);
        setGuesses({});
        setGuesserCursor(0);

        setHydrated(true);
      } catch (e) {
        console.warn("Failed to load state:", e);
        setHydrated(true);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    async function save() {
      try {
        await savePersistedState({
          players,
          targetId,
          scores,
        });
      } catch (e) {
        console.warn("Failed to save state:", e);
      }
    }

    save();
  }, [hydrated, players, targetId, scores]);

  /**
   * =========================================
   * 5) SETUP FUNCTIONS – add/remove/select target
   * =========================================
   */

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;

    const exists = players.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return;

    const player: Player = { id: String(Date.now()), name };

    setPlayers((prev) => [...prev, player]);
    setNewName("");

    if (players.length === 0) setTargetId(player.id);

    setScores((prev) => {
      if (prev[player.id] !== undefined) return prev;
      return { ...prev, [player.id]: 0 };
    });
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));

    if (id === targetId) setTargetId(null);

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
   * 6) GAME FLOW FUNCTIONS – start/pick/guess/result
   * =========================================
   */

  function startGame() {
    if (!canStart) return;

    setPairIndex(0);
    setPicked(null);
    setGuesses({});
    setGuesserCursor(0);

    setPhase("PICK");
  }

  function pickOption(option: OptionKey) {
    setPicked(option);

    setGuesses({});
    setGuesserCursor(0);

    setPhase("GUESS");
  }

  function submitGuess(option: OptionKey) {
    if (!currentGuesser) return;

    setGuesses((prev) => ({
      ...prev,
      [currentGuesser.id]: option,
    }));

    const nextCursor = guesserCursor + 1;

    if (nextCursor < guesserIds.length) {
      setGuesserCursor(nextCursor);
      return;
    }

    setPhase("RESULT");
  }

  function applyScoresAndNextRound() {
    if (!picked || !targetId) return;

    setScores((prev) => {
      const next = { ...prev };

      for (const gid of guesserIds) {
        const g = guesses[gid];
        if (g && g === picked) {
          next[gid] = (next[gid] ?? 0) + 1;
        } else {
          next[gid] = next[gid] ?? 0;
        }
      }

      next[targetId] = next[targetId] ?? 0;

      return next;
    });

    setPairIndex((prev) => (prev + 1) % PAIRS.length);

    setPicked(null);
    setGuesses({});
    setGuesserCursor(0);

    setPhase("PICK");
  }

  /**
   * =========================================
   * 7) PREP RESULT DATA – připravíme data pro ResultScreen
   * =========================================
   */

  const correctLabel =
    picked === "A"
      ? `A: ${currentPair.A}`
      : picked === "B"
      ? `B: ${currentPair.B}`
      : "?";

  const resultRows = guesserIds.map((gid) => {
    const p = players.find((x) => x.id === gid);
    const g = guesses[gid];
    const ok = picked !== null && g === picked;

    return {
      id: gid,
      name: p?.name ?? "?",
      guess: g ? g : "—",
      ok,
    };
  });

  /**
   * =========================================
   * 8) RENDER – vyber obrazovku podle phase
   * =========================================
   */

  if (phase === "SETUP") {
    return (
      <SetupScreen
        players={players}
        scores={scores}
        targetId={targetId}
        newName={newName}
        onChangeNewName={setNewName}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onSelectTarget={setTargetId}
        targetPlayerName={targetPlayerName}
        canStart={canStart}
        onStartGame={startGame}
        hydrated={hydrated}
      />
    );
  }

  if (phase === "PICK") {
    return (
      <PickScreen
        targetName={targetPlayerName ?? "?"}
        pair={currentPair}
        onPick={pickOption}
      />
    );
  }

  if (phase === "GUESS") {
    return (
      <GuessScreen
        guesserName={currentGuesserName}
        targetName={targetPlayerName ?? "cílový hráč"}
        pair={currentPair}
        progressText={`${guesserCursor + 1} / ${guesserIds.length} tipujících hotovo`}
        onGuess={submitGuess}
      />
    );
  }

  return (
    <ResultScreen
      title={currentPair.label}
      correctLabel={correctLabel}
      rows={resultRows}
      onNextRound={applyScoresAndNextRound}
      onBackToSetup={() => setPhase("SETUP")}
    />
  );
}
