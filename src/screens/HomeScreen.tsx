import { Pressable, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { getLevel, getLevelProgress } from '../logic/progression';
import { GameState, ScreenName } from '../types/game';
import { AppText, Label, Page, Rule } from '../components/ui';
import { strings } from '../constants/strings';
import { theme } from '../constants/theme';

export function HomeScreen({
  game,
  onNavigate,
}: {
  game: GameState;
  onNavigate: (screen: ScreenName) => void;
}) {
  const level = getLevel(game.totalXp);
  const progress = getLevelProgress(game.totalXp);
  const pendingCount = game.missions.filter((mission) => mission.status === 'pending').length;

  return (
    <Page>
      <Label>{strings.tabs.home}</Label>

      <View style={styles.primary}>
        <AppText style={styles.level}>{strings.format.levelShort(level)}</AppText>
        <AppText style={styles.levelCaption}>{strings.home.journey}</AppText>
      </View>

      <Rule />

      <View style={styles.support}>
        <Label>{strings.home.experience}</Label>
        <AppText style={styles.xpValue}>
          {strings.format.xpProgress(progress.current, progress.required)}
        </AppText>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(progress.current / progress.required) * 100}%` }]} />
        </View>
      </View>

      <Rule />

      <View style={styles.pending}>
        <Label>{strings.home.toComplete}</Label>
        <AppText style={styles.pendingCount}>{pendingCount}</AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => onNavigate('quests')}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <AppText style={styles.actionText}>{strings.home.seeAll}</AppText>
        <Feather color={theme.acentos.inicio} name="arrow-right" size={theme.espaciado.tamanoIcono} />
      </Pressable>
    </Page>
  );
}

const styles = StyleSheet.create({
  primary: { gap: theme.espaciado.pequeno, alignItems: 'flex-start' },
  level: { color: theme.acentos.inicio, ...theme.tipografia.titulo },
  levelCaption: { color: theme.texto, ...theme.tipografia.subtitulo },
  support: { gap: theme.espaciado.pequeno },
  xpValue: { color: theme.texto, ...theme.tipografia.subtitulo },
  progressTrack: {
    height: theme.espaciado.altoBarraProgreso,
    overflow: 'hidden',
    backgroundColor: theme.linea,
  },
  progressFill: { height: '100%', backgroundColor: theme.acentos.inicio },
  pending: { gap: theme.espaciado.pequeno },
  pendingCount: { color: theme.texto, ...theme.tipografia.titulo },
  action: {
    minHeight: theme.espaciado.altoControl,
    paddingHorizontal: theme.espaciado.base,
    borderWidth: theme.espaciado.anchoBorde,
    borderColor: theme.linea,
    borderRadius: theme.radios.boton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: { color: theme.texto, ...theme.tipografia.subtitulo },
  pressed: { opacity: 0.72 },
});
