import { StyleSheet, View } from 'react-native';
import { ACHIEVEMENTS, getCompletedMissions, getLevel } from '../logic/progression';
import { GameState } from '../types/game';
import { AppText, Label, Page, Rule } from '../components/ui';
import { strings } from '../constants/strings';
import { theme } from '../constants/theme';

export function AchievementsScreen({ game }: { game: GameState }) {
  const completed = getCompletedMissions(game).length;
  const level = getLevel(game.totalXp);
  const activeDays = new Set(game.activityDates).size;
  const unlocked = new Set(game.unlockedAchievements);
  const unlockedCount = ACHIEVEMENTS.filter((achievement) => unlocked.has(achievement.id)).length;

  return (
    <Page>
      <Label>{strings.achievements.title}</Label>

      <View style={styles.primary}>
        <AppText style={styles.count}>
          {strings.format.achievementCount(unlockedCount, ACHIEVEMENTS.length)}
        </AppText>
        <AppText style={styles.caption}>{strings.achievements.unlocked}</AppText>
      </View>

      <Rule />

      <View style={styles.list}>
        {ACHIEVEMENTS.map((achievement, index) => {
          const progress = getAchievementProgress(achievement.id, completed, level, activeDays);
          const goal = getAchievementGoal(achievement.id);
          const isUnlocked = unlocked.has(achievement.id);
          const details = strings.achievementDetails[achievement.id];

          return (
            <View key={achievement.id}>
              {index > 0 ? <Rule /> : null}
              <View style={styles.achievement}>
                <View style={styles.achievementHeading}>
                  <AppText style={styles.achievementTitle}>{details.title}</AppText>
                  <Label style={isUnlocked ? styles.unlocked : undefined}>
                    {isUnlocked
                      ? strings.achievements.unlockedLabel
                      : strings.format.progress(progress, goal)}
                  </Label>
                </View>
                <AppText style={styles.description}>{details.description}</AppText>
              </View>
            </View>
          );
        })}
      </View>
    </Page>
  );
}

function getAchievementProgress(
  id: (typeof ACHIEVEMENTS)[number]['id'],
  completed: number,
  level: number,
  activeDays: number,
): number {
  switch (id) {
    case 'first-quest':
      return Math.min(completed, 1);
    case 'ten-quests':
      return Math.min(completed, 10);
    case 'level-five':
      return Math.min(level, 5);
    case 'seven-days':
      return Math.min(activeDays, 7);
  }
}

function getAchievementGoal(id: (typeof ACHIEVEMENTS)[number]['id']): number {
  switch (id) {
    case 'first-quest':
      return 1;
    case 'ten-quests':
      return 10;
    case 'level-five':
      return 5;
    case 'seven-days':
      return 7;
  }
}

const styles = StyleSheet.create({
  primary: { alignItems: 'flex-start', gap: theme.espaciado.pequeno },
  count: { color: theme.acentos.logros, ...theme.tipografia.titulo },
  caption: { color: theme.texto, ...theme.tipografia.subtitulo },
  list: { gap: theme.espaciado.base },
  achievement: { gap: theme.espaciado.pequeno, paddingVertical: theme.espaciado.base },
  achievementHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.espaciado.pequeno,
  },
  achievementTitle: { color: theme.texto, ...theme.tipografia.subtitulo, flexShrink: 1 },
  unlocked: { color: theme.acentos.logros },
  description: { color: theme.textoSecundario, ...theme.tipografia.cuerpo },
});
