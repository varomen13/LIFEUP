import AsyncStorage from '@react-native-async-storage/async-storage';
import { ATTRIBUTES, Attribute, DIFFICULTIES, GameState, Mission } from '../types/game';
import { strings } from '../constants/strings';

const STORAGE_KEY = '@lifeup/progress-v1';

function isMission(value: unknown): value is Mission {
  if (!value || typeof value !== 'object') return false;
  const mission = value as Record<string, unknown>;
  return (
    typeof mission.id === 'string' &&
    typeof mission.title === 'string' &&
    typeof mission.description === 'string' &&
    DIFFICULTIES.includes(mission.difficulty as Mission['difficulty']) &&
    ATTRIBUTES.includes(mission.attribute as Attribute) &&
    (mission.status === 'pending' || mission.status === 'completed') &&
    typeof mission.createdAt === 'string' &&
    (mission.completedAt === undefined || typeof mission.completedAt === 'string') &&
    (mission.xpAwarded === undefined || typeof mission.xpAwarded === 'number')
  );
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const game = value as Record<string, unknown>;
  const attributes = game.attributes;
  return (
    Array.isArray(game.missions) &&
    game.missions.every(isMission) &&
    typeof game.totalXp === 'number' &&
    Number.isFinite(game.totalXp) &&
    game.totalXp >= 0 &&
    !!attributes &&
    typeof attributes === 'object' &&
    ATTRIBUTES.every(
      (attribute) =>
        typeof (attributes as Record<string, unknown>)[attribute] === 'number' &&
        Number.isFinite((attributes as Record<string, number>)[attribute]),
    ) &&
    Array.isArray(game.unlockedAchievements) &&
    game.unlockedAchievements.every((id) => typeof id === 'string') &&
    Array.isArray(game.activityDates) &&
    game.activityDates.every((date) => typeof date === 'string')
  );
}

export async function loadProgress(): Promise<GameState | null> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (saved === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(saved);
  } catch {
    throw new Error(strings.loading.unreadableProgress);
  }

  if (!isGameState(parsed)) {
    throw new Error(strings.loading.invalidProgress);
  }
  const sampleIndexes: Record<string, number> = {
    'sample-read': 0,
    'sample-move': 1,
    'sample-plan': 2,
  };
  return {
    ...parsed,
    missions: parsed.missions.map((mission) => {
      const sampleIndex = sampleIndexes[mission.id];
      const legacy = strings.legacyMissionSamples[sampleIndex];
      const translated = strings.missionSamples[sampleIndex];
      if (!legacy || !translated) return mission;
      return {
        ...mission,
        title: mission.title === legacy.title ? translated.title : mission.title,
        description: mission.description === legacy.description ? translated.description : mission.description,
      };
    }),
  };
}

export async function saveProgress(progress: GameState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
