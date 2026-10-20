import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createInitialGameState, refreshAchievements } from '../logic/progression';
import { loadProgress, saveProgress } from '../storage/progressStorage';
import { GameState } from '../types/game';
import { strings } from '../constants/strings';

type GameContextValue = {
  game: GameState | null;
  storageError: string | null;
  updateGame: (update: (current: GameState) => GameState) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    loadProgress()
      .then((progress) => {
        if (active) setGame(refreshAchievements(progress ?? createInitialGameState()));
      })
      .catch((error: unknown) => {
        if (active) {
          const isReadableStorageError = error instanceof Error && (
            error.message === strings.loading.invalidProgress ||
            error.message === strings.loading.unreadableProgress
          );
          setStorageError(isReadableStorageError ? error.message : strings.loading.loadError);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!game) return;
    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(() => saveProgress(game))
      .then(() => setStorageError(null))
      .catch(() => {
        setStorageError(strings.loading.saveError);
      });
  }, [game]);

  const updateGame = useCallback((update: (current: GameState) => GameState) => {
    setGame((current) => (current ? update(current) : current));
  }, []);

  const value = useMemo(
    () => ({ game, storageError, updateGame }),
    [game, storageError, updateGame],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider.');
  return context;
}
