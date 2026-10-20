import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { ATTRIBUTE_LABELS, XP_REWARDS } from '../logic/progression';
import { Mission } from '../types/game';
import { AppText, Label } from './ui';
import { strings } from '../constants/strings';
import { theme } from '../constants/theme';

const difficultyAccents = {
  easy: theme.acentos.inicio,
  medium: theme.acentos.misiones,
  hard: theme.acentos.heroe,
};

export function QuestCard({
  mission,
  onComplete,
  onDelete,
}: {
  mission: Mission;
  onComplete?: () => void;
  onDelete?: () => void;
}) {
  const completed = mission.status === 'completed';
  const [completionProgress] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!completed) return;
    completionProgress.setValue(0);
    const animation = Animated.timing(completionProgress, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [completed, completionProgress]);

  return (
    <Animated.View style={[styles.animatedRow, { opacity: completionProgress }]}>
      <View style={styles.row}>
        <View style={styles.heading}>
          <AppText numberOfLines={1} style={[styles.title, completed && styles.completedTitle]}>
            {mission.title}
          </AppText>
          <Label style={styles.xp}>
            {strings.format.xp(mission.xpAwarded ?? XP_REWARDS[mission.difficulty])}
          </Label>
        </View>
        <AppText numberOfLines={1} style={styles.meta}>
          {ATTRIBUTE_LABELS[mission.attribute]} ·{' '}
          <Text style={{ color: difficultyAccents[mission.difficulty] }}>
            {strings.difficulty[mission.difficulty]}
          </Text>
        </AppText>
        {mission.description ? (
          <AppText numberOfLines={2} style={styles.description}>{mission.description}</AppText>
        ) : null}
        {completed ? (
          <View style={styles.done}>
            <Feather color={theme.acentos.inicio} name="check-circle" size={theme.espaciado.tamanoIcono} />
            <Label style={styles.doneText}>{strings.format.completed}</Label>
          </View>
        ) : onComplete ? (
          <View style={styles.actions}>
            {onDelete ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.format.deleteMission(mission.title)}
                onPress={onDelete}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              >
                <AppText style={styles.deleteText}>{strings.format.delete}</AppText>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={onComplete}
              style={({ pressed }) => [styles.completeButton, pressed && styles.pressed]}
            >
              <AppText style={styles.completeText}>{strings.format.complete}</AppText>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedRow: { width: '100%' },
  row: {
    gap: theme.espaciado.pequeno,
    paddingVertical: theme.espaciado.base,
    borderBottomWidth: theme.espaciado.anchoBorde,
    borderBottomColor: theme.linea,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.espaciado.pequeno,
  },
  title: { color: theme.texto, ...theme.tipografia.subtitulo, flex: 1 },
  completedTitle: { color: theme.textoSecundario },
  xp: { color: theme.acentos.inicio },
  meta: { color: theme.textoSecundario, ...theme.tipografia.etiqueta },
  description: { color: theme.textoSecundario, ...theme.tipografia.cuerpo },
  done: { minHeight: theme.espaciado.altoControl, flexDirection: 'row', alignItems: 'center', gap: theme.espaciado.pequeno },
  doneText: { color: theme.acentos.inicio },
  actions: { flexDirection: 'row', alignItems: 'center', gap: theme.espaciado.pequeno },
  deleteButton: {
    minHeight: theme.espaciado.altoControl,
    minWidth: theme.espaciado.altoControl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.espaciado.pequeno,
    borderWidth: theme.espaciado.anchoBorde,
    borderColor: theme.linea,
    borderRadius: theme.radios.boton,
  },
  deleteText: { color: theme.textoSecundario, ...theme.tipografia.etiqueta },
  completeButton: {
    minHeight: theme.espaciado.altoControl,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.acentos.misiones,
    borderRadius: theme.radios.boton,
  },
  completeText: { color: theme.fondo, ...theme.tipografia.subtitulo },
  pressed: { opacity: 0.72 },
});
