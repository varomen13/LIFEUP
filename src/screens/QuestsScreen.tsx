import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { addMission, ATTRIBUTE_LABELS, completeMission, removePendingMission, XP_REWARDS } from '../logic/progression';
import { Attribute, ATTRIBUTES, Difficulty, DIFFICULTIES, GameState } from '../types/game';
import { AppText as Text, Label, Page, Rule } from '../components/ui';
import { QuestCard } from '../components/QuestCard';
import { strings } from '../constants/strings';
import { theme } from '../constants/theme';

export function QuestsScreen({
  game,
  onUpdate,
}: {
  game: GameState;
  onUpdate: (update: (current: GameState) => GameState) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formStep, setFormStep] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [attribute, setAttribute] = useState<Attribute>('discipline');
  const [formError, setFormError] = useState('');
  const pending = game.missions.filter((mission) => mission.status === 'pending');
  const completed = [...game.missions].filter((mission) => mission.status === 'completed').reverse();

  const continueForm = () => {
    if (!title.trim()) {
      setFormError(strings.quests.missingName);
      return;
    }
    setFormError('');
    setFormStep(2);
  };

  const createQuest = () => {
    onUpdate((current) =>
      addMission(current, { title: title.trim(), description: description.trim(), difficulty, attribute }),
    );
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setAttribute('discipline');
    setFormError('');
    setFormStep(1);
    setFormOpen(false);
  };

  return (
    <Page>
      <Label>{strings.tabs.quests}</Label>

      <View style={styles.heading}>
        <Text style={styles.title}>{strings.format.activeCount(pending.length)}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFormOpen((open) => !open)}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Feather color={theme.acentos.misiones} name={formOpen ? 'x' : 'plus'} size={theme.espaciado.tamanoIcono} />
          <Text style={styles.addText}>
            {formOpen ? strings.quests.closeForm : strings.quests.createMission}
          </Text>
        </Pressable>
      </View>

      {formOpen ? (
        <View style={styles.form}>
          <Rule />
          <Label>{`${formStep}/2`}</Label>
          {formStep === 1 ? (
            <>
              <Label>{strings.quests.missionName}</Label>
              <TextInput
                accessibilityLabel={strings.quests.missionName}
                maxLength={60}
                onChangeText={setTitle}
                placeholder={strings.quests.titlePlaceholder}
                placeholderTextColor={theme.textoSecundario}
                returnKeyType="next"
                style={styles.input}
                value={title}
              />
              <Label>{strings.quests.descriptionLabel}</Label>
              <TextInput
                accessibilityLabel={strings.quests.descriptionLabel}
                maxLength={140}
                onChangeText={setDescription}
                placeholder={strings.quests.descriptionPlaceholder}
                placeholderTextColor={theme.textoSecundario}
                style={styles.input}
                value={description}
              />
            </>
          ) : (
            <>
              <Label>{strings.quests.difficultyReward}</Label>
              <View style={styles.choices}>
                {DIFFICULTIES.map((item) => (
                  <ChoiceChip
                    key={item}
                    label={strings.format.missionDifficulty(strings.difficulty[item], XP_REWARDS[item])}
                    selected={difficulty === item}
                    onPress={() => setDifficulty(item)}
                  />
                ))}
              </View>
              <Label>{strings.quests.attribute}</Label>
              <View style={styles.choices}>
                {ATTRIBUTES.map((item) => (
                  <ChoiceChip
                    key={item}
                    label={ATTRIBUTE_LABELS[item]}
                    selected={attribute === item}
                    onPress={() => setAttribute(item)}
                  />
                ))}
              </View>
            </>
          )}
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          {formStep === 1 ? (
            <Pressable
              accessibilityRole="button"
              onPress={continueForm}
              style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
            >
              <Text style={styles.submitText}>{strings.quests.next}</Text>
            </Pressable>
          ) : (
            <View style={styles.formActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setFormStep(1)}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Text style={styles.backText}>{strings.quests.back}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={createQuest}
                style={({ pressed }) => [styles.submitButton, styles.finishButton, pressed && styles.pressed]}
              >
                <Text style={styles.submitText}>{strings.quests.addMission}</Text>
              </Pressable>
            </View>
          )}
          <Rule />
        </View>
      ) : null}

      {pending.length > 0 ? (
        <View>
          {pending.map((mission) => (
            <QuestCard
              key={mission.id}
              mission={mission}
              onComplete={() => onUpdate((current) => completeMission(current, mission.id))}
              onDelete={() => onUpdate((current) => removePendingMission(current, mission.id))}
            />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{strings.quests.noActive}</Text>
          <Text style={styles.emptyHint}>{strings.quests.begin}</Text>
        </View>
      )}

      {completed.length ? (
        <View style={styles.completed}>
          <Rule />
          <Label>{strings.format.completedCount(completed.length)}</Label>
          {completed.map((mission) => <QuestCard key={mission.id} mission={mission} />)}
        </View>
      ) : null}
    </Page>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.selectedChoice,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.choiceText, selected && styles.selectedChoiceText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: { gap: theme.espaciado.base, alignItems: 'flex-start' },
  title: { color: theme.acentos.misiones, ...theme.tipografia.titulo },
  addButton: {
    minHeight: theme.espaciado.altoControl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.espaciado.pequeno,
    paddingHorizontal: theme.espaciado.base,
    borderColor: theme.linea,
    borderWidth: theme.espaciado.anchoBorde,
    borderRadius: theme.radios.boton,
  },
  addText: { color: theme.texto, ...theme.tipografia.subtitulo },
  form: { gap: theme.espaciado.base },
  input: {
    minHeight: theme.espaciado.altoControl,
    paddingHorizontal: theme.espaciado.pequeno,
    color: theme.texto,
    ...theme.tipografia.cuerpo,
    borderBottomWidth: theme.espaciado.anchoBorde,
    borderBottomColor: theme.linea,
  },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.espaciado.pequeno },
  choice: {
    minHeight: theme.espaciado.altoControl,
    justifyContent: 'center',
    paddingHorizontal: theme.espaciado.base,
    borderWidth: theme.espaciado.anchoBorde,
    borderColor: theme.linea,
    borderRadius: theme.radios.boton,
  },
  selectedChoice: { borderColor: theme.acentos.misiones },
  choiceText: { color: theme.textoSecundario, ...theme.tipografia.etiqueta },
  selectedChoiceText: { color: theme.acentos.misiones },
  formError: { color: theme.acentos.misiones, ...theme.tipografia.cuerpo },
  formActions: { flexDirection: 'row', gap: theme.espaciado.pequeno },
  submitButton: {
    minHeight: theme.espaciado.altoControl,
    minWidth: theme.espaciado.altoControl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.espaciado.base,
    backgroundColor: theme.acentos.misiones,
    borderRadius: theme.radios.boton,
  },
  finishButton: { flex: 1 },
  submitText: { color: theme.fondo, ...theme.tipografia.subtitulo },
  backButton: {
    minHeight: theme.espaciado.altoControl,
    justifyContent: 'center',
    paddingHorizontal: theme.espaciado.base,
    borderWidth: theme.espaciado.anchoBorde,
    borderColor: theme.linea,
    borderRadius: theme.radios.boton,
  },
  backText: { color: theme.texto, ...theme.tipografia.subtitulo },
  empty: { gap: theme.espaciado.pequeno, paddingVertical: theme.espaciado.medio },
  emptyText: { color: theme.texto, ...theme.tipografia.subtitulo },
  emptyHint: { color: theme.textoSecundario, ...theme.tipografia.cuerpo },
  completed: { gap: theme.espaciado.base },
  pressed: { opacity: 0.72 },
});
