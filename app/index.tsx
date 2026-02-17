import { GameOverScreen } from "@/src/screens/GameOverScreen";
import { PassScreen } from "@/src/screens/PassScreen";
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
   * SETUP STATE – hráči + cílový hráč
   * =========================================
   */

  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [round, setRound ] = useState(1);
  const MAX_ROUNDS = 10;

  /**
   * =========================================
   * GAME STATE – průběh hry
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
   * DERIVED VALUES – spočítané hodnoty ze state
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
   * PERSISTENCE – LOAD při startu + SAVE při změnách
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
   * SETUP FUNCTIONS – add/remove/select target/reset score/new game
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

  function resetScores() {
    setScores((prev) => {
      const next: Record<string, number> = { ...prev };
  
      for (const p of players) {
        next[p.id] = 0;
      }
  
      return next;
    });
  }
  
  function newGame() {
    /**
     * Nová hra = začneme od nuly:
     * - reset skóre všech existujících hráčů na 0
     * - reset průběhu (round, pair, guesses...)
     * - vrátíme se do SETUP
     */
    setScores((prev) => {
      const next = { ...prev };
      for (const p of players) next[p.id] = 0;
      return next;
    });
  
    setRound(1);
    setPairIndex(0);
    setPicked(null);
    setGuesses({});
    setGuesserCursor(0);
  
    setPhase("SETUP");
  }
  
  /**
   * =========================================
   * GAME FLOW FUNCTIONS – start/pick/guess/result
   * =========================================
   */

  function startGame() {
    if (!canStart) return;

    setRound(1);
    setPairIndex(0);
    setPicked(null);
    setGuesses({});
    setGuesserCursor(0);
    // Nejdřív ukážeme předdání telefonu cílovému hráči.
    setPhase("PASS_TO_TARGET");
  }

  function pickOption(option: OptionKey) {
    setPicked(option);

    setGuesses({});
    setGuesserCursor(0);
    // Po tajné volbě předáme telefon prvnímu tipujícímu.
    setPhase("PASS_TO_GUESSOR");
  }

  function submitGuess(option: OptionKey) {
    if (!currentGuesser) return;
  
    /**
     * nextGuesses = vytvoříme “finální” guesses objekt pro tento krok.
     * Důležité:
     * - musíme do něj zahrnout i právě zadaný tip
     * - protože setGuesses je async a v tenhle moment by ve state ještě nebyl
     */
    const nextGuesses: Record<string, OptionKey> = {
      ...guesses,
      [currentGuesser.id]: option,
    };
  
    // uložíme tip do state
    setGuesses(nextGuesses);
  
    const nextCursor = guesserCursor + 1;
  
    // pokud existuje další tipující, posuneme cursor a ukážeme předání telefonu
    if (nextCursor < guesserIds.length) {
      setGuesserCursor(nextCursor);
      setPhase("PASS_TO_GUESSOR");
      return;
    }
  
    /**
     * Pokud jsme tady:
     * - právě tipoval poslední tipující
     * - teď je správný moment přičíst body (ať už uživatel pak klikne kamkoliv)
     */
    if (!picked || !targetId) {
      // bezpečnostní pojistka (normálně by picked/targetId měly být nastavené)
      setPhase("RESULT");
      return;
    }
  
    setScores((prev) => {
      const next = { ...prev };
  
      for (const gid of guesserIds) {
        const g = nextGuesses[gid];
        if (g && g === picked) {
          next[gid] = (next[gid] ?? 0) + 1;
        } else {
          next[gid] = next[gid] ?? 0;
        }
      }
  
      // targetovi skóre neměníme (zatím)
      next[targetId] = next[targetId] ?? 0;
  
      return next;
    });
  
    // teprve potom ukážeme RESULT
    setPhase("RESULT");
  }
  

    function applyScoresAndNextRound() {
        /**
         * Skóre už je přičtené při přechodu do RESULT.
         * Tady řešíme jen:
         * - jestli hra končí (round >= MAX_ROUNDS)
         * - nebo připravit další kolo
         */
    
        // Pokud jsme právě dohráli poslední kolo, jdeme na GAME_OVER.
        if (round >= MAX_ROUNDS) {
        setPhase("GAME_OVER");
        return;
        }
    
        // Jinak zvyšujeme číslo kola o 1.
        setRound((prev) => prev + 1);
    
        // další dvojice (cyklicky)
        setPairIndex((prev) => (prev + 1) % PAIRS.length);
    
        // reset kola
        setPicked(null);
        setGuesses({});
        setGuesserCursor(0);
    
        // předání telefonu cílovému hráči pro další tajnou volbu
        setPhase("PASS_TO_TARGET");
    }
  
  

  /**
   * =========================================
   * PREP RESULT DATA – připravíme data pro ResultScreen
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
     * GAME OVER DATA – seřazené skóre hráčů
     * =========================================
     */
    const gameOverRows = useMemo(() => {
        const rows = players.map((p) => ({
        id: p.id,
        name: p.name,
        score: scores[p.id] ?? 0,
        }));
    
        // seřadíme od nejvyššího skóre
        rows.sort((a, b) => b.score - a.score);
    
        return rows;
    }, [players, scores]);
    
  /**
   * =========================================
   * RENDER – vyber obrazovku podle phase
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
        onResetScores={resetScores}
      />
    );
  }

  if (phase === "PASS_TO_TARGET") {
    return (
        <PassScreen
            title="Předání telefonu"
            instruction="Telefon vezme (cílová hráč):"
            playerName={targetPlayerName ?? "?"}
            buttonText="Jsem připraven"
            onContinue={() => setPhase("PICK")}
        />
    )
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

  if (phase === "PASS_TO_GUESSOR") {
    return (
        <PassScreen
            title="Předání telefonu"
            instruction="Telefon vezme (tipující)"
            playerName={currentGuesserName}
            buttonText="Jsem připraven"
            onContinue={() => setPhase("GUESS")}
        />
    )
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

  if (phase === "GAME_OVER") {
    return <GameOverScreen rows={gameOverRows} onNewGame={newGame} />;
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
