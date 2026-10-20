import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ATTRIBUTE_LABELS, getLevel } from '../logic/progression';
import { Attribute, ATTRIBUTES, GameState } from '../types/game';
import { AppText, Label, Page, Rule } from '../components/ui';
import { strings } from '../constants/strings';
import { theme } from '../constants/theme';

export function CharacterScreen({ game }: { game: GameState }) {
  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const level = getLevel(game.totalXp);
  const strongestAttributes = [...ATTRIBUTES]
    .sort((first, second) => game.attributes[second] - game.attributes[first])
    .slice(0, 2);

  return (
    <Page>
      <Label>{strings.character.title}</Label>

      <View style={styles.primary}>
        <AppText style={styles.level}>{strings.format.levelShort(level)}</AppText>
        <AppText style={styles.caption}>{strings.character.adventurer}</AppText>
      </View>

      <Rule />

      <View style={styles.attributes}>
        <Label>{strings.character.attributes}</Label>
        {(showAllAttributes ? ATTRIBUTES : strongestAttributes).map((attribute) => (
          <AttributeRow
            key={attribute}
            attribute={attribute}
            value={game.attributes[attribute]}
          />
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showAllAttributes }}
          onPress={() => setShowAllAttributes((shown) => !shown)}
          style={({ pressed }) => [styles.attributeToggle, pressed && styles.pressed]}
        >
          <AppText style={styles.toggleText}>
            {showAllAttributes ? strings.character.showLess : strings.character.showAll}
          </AppText>
        </Pressable>
      </View>
    </Page>
  );
}

function AttributeRow({ attribute, value }: { attribute: Attribute; value: number }) {
  return (
    <View style={styles.attributeRow}>
      <AppText style={styles.attributeName}>{ATTRIBUTE_LABELS[attribute]}</AppText>
      <AppText style={styles.attributeValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  primary: { alignItems: 'flex-start', gap: theme.espaciado.pequeno },
  level: { color: theme.acentos.heroe, ...theme.tipografia.titulo },
  caption: { color: theme.texto, ...theme.tipografia.subtitulo },
  attributes: { gap: theme.espaciado.base },
  attributeRow: {
    minHeight: theme.espaciado.altoControl,
    borderBottomWidth: theme.espaciado.anchoBorde,
    borderBottomColor: theme.linea,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attributeName: { color: theme.texto, ...theme.tipografia.cuerpo },
  attributeValue: { color: theme.acentos.heroe, ...theme.tipografia.subtitulo },
  attributeToggle: {
    minHeight: theme.espaciado.altoControl,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: theme.espaciado.base,
    borderWidth: theme.espaciado.anchoBorde,
    borderColor: theme.linea,
    borderRadius: theme.radios.boton,
  },
  toggleText: { color: theme.acentos.heroe, ...theme.tipografia.subtitulo },
  pressed: { opacity: 0.72 },
});
