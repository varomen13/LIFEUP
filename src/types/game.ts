export const ATTRIBUTES = ['intelligence', 'strength', 'discipline', 'creativity'] as const;
export type Attribute = (typeof ATTRIBUTES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type Mission = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  attribute: Attribute;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
  xpAwarded?: number;
};

export type GameState = {
  missions: Mission[];
  totalXp: number;
  attributes: Record<Attribute, number>;
  unlockedAchievements: string[];
  activityDates: string[];
};

export type ScreenName = 'home' | 'quests' | 'character' | 'achievements';
