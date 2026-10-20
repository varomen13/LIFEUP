import { Attribute, Difficulty, GameState, Mission } from '../types/game';
import { strings } from '../constants/strings';

export const XP_PER_LEVEL = 100;
export const XP_REWARDS: Record<Difficulty, number> = {
  easy: 20,
  medium: 50,
  hard: 100,
};

export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  intelligence: strings.attributes.intelligence,
  strength: strings.attributes.strength,
  discipline: strings.attributes.discipline,
  creativity: strings.attributes.creativity,
};

export const ACHIEVEMENTS = [
  { id: 'first-quest', ...strings.achievementDetails['first-quest'] },
  { id: 'ten-quests', ...strings.achievementDetails['ten-quests'] },
  { id: 'level-five', ...strings.achievementDetails['level-five'] },
  { id: 'seven-days', ...strings.achievementDetails['seven-days'] },
] as const;

export function getLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

export function getLevelProgress(totalXp: number): { current: number; required: number } {
  return { current: totalXp % XP_PER_LEVEL, required: XP_PER_LEVEL };
}

export function getCompletedMissions(game: GameState): Mission[] {
  return game.missions.filter((mission) => mission.status === 'completed');
}

export function getUnlockedAchievementIds(game: GameState): string[] {
  const completedCount = getCompletedMissions(game).length;
  const level = getLevel(game.totalXp);
  const unlocked = new Set<string>();

  if (completedCount >= 1) unlocked.add('first-quest');
  if (completedCount >= 10) unlocked.add('ten-quests');
  if (level >= 5) unlocked.add('level-five');
  if (new Set(game.activityDates).size >= 7) unlocked.add('seven-days');

  return [...unlocked];
}

export function refreshAchievements(game: GameState): GameState {
  return { ...game, unlockedAchievements: getUnlockedAchievementIds(game) };
}

export function createInitialGameState(): GameState {
  const createdAt = new Date().toISOString();
  const [read, walk, plan] = strings.missionSamples;
  return {
    missions: [
      {
        id: 'sample-read',
        ...read,
        difficulty: 'easy',
        attribute: 'intelligence',
        status: 'pending',
        createdAt,
      },
      {
        id: 'sample-move',
        ...walk,
        difficulty: 'medium',
        attribute: 'strength',
        status: 'pending',
        createdAt,
      },
      {
        id: 'sample-plan',
        ...plan,
        difficulty: 'easy',
        attribute: 'discipline',
        status: 'pending',
        createdAt,
      },
    ],
    totalXp: 0,
    attributes: { intelligence: 1, strength: 1, discipline: 1, creativity: 1 },
    unlockedAchievements: [],
    activityDates: [],
  };
}

export function addMission(
  game: GameState,
  mission: Pick<Mission, 'title' | 'description' | 'difficulty' | 'attribute'>,
): GameState {
  const newMission: Mission = {
    ...mission,
    id: `mission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  return { ...game, missions: [newMission, ...game.missions] };
}

export function removePendingMission(game: GameState, missionId: string): GameState {
  return {
    ...game,
    missions: game.missions.filter(
      (mission) => mission.id !== missionId || mission.status !== 'pending',
    ),
  };
}

export function completeMission(
  game: GameState,
  missionId: string,
  completedAt: Date = new Date(),
): GameState {
  const mission = game.missions.find((item) => item.id === missionId);
  if (!mission || mission.status !== 'pending') return game;

  const xpAwarded = XP_REWARDS[mission.difficulty];
  const day = `${completedAt.getFullYear()}-${String(completedAt.getMonth() + 1).padStart(2, '0')}-${String(completedAt.getDate()).padStart(2, '0')}`;
  const next: GameState = {
    ...game,
    totalXp: game.totalXp + xpAwarded,
    attributes: {
      ...game.attributes,
      [mission.attribute]: game.attributes[mission.attribute] + 1,
    },
    activityDates: [...new Set([...game.activityDates, day])],
    missions: game.missions.map((item) =>
      item.id === missionId
        ? { ...item, status: 'completed', completedAt: completedAt.toISOString(), xpAwarded }
        : item,
    ),
  };
  return refreshAchievements(next);
}
