import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  cancelAnimation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { CharacterScreen } from '../screens/CharacterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { QuestsScreen } from '../screens/QuestsScreen';
import { strings } from '../constants/strings';
import { theme } from '../constants/theme';
import { GameState, ScreenName } from '../types/game';

const MODULES: ScreenName[] = ['home', 'quests', 'character', 'achievements'];
const MODULE_TITLES = [strings.tabs.home, strings.tabs.quests, strings.tabs.character, strings.tabs.achievements];
const MODULE_ACCENTS = [
  theme.acentos.inicio,
  theme.acentos.misiones,
  theme.acentos.heroe,
  theme.acentos.logros,
];
const MODULE_INACTIVE_ACCENTS = [
  theme.puntosInactivos.inicio,
  theme.puntosInactivos.misiones,
  theme.puntosInactivos.heroe,
  theme.puntosInactivos.logros,
];
const HINT_STORAGE_KEY = '@lifeup/module-swipe-hint-v1';

export function ModulePager({
  game,
  onUpdate,
}: {
  game: GameState;
  onUpdate: (update: (current: GameState) => GameState) => void;
}) {
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<ScreenName>>(null);
  const labelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollX = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const hintPulseScale = useSharedValue(1);
  const labelOpacity = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hintError, setHintError] = useState<string | null>(null);
  const [visibleTitle, setVisibleTitle] = useState('');

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const scrollToModule = useCallback((module: ScreenName) => {
    const index = MODULES.indexOf(module);
    if (index >= 0) listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const showModuleTitle = (offset: number) => {
    const nextIndex = Math.max(0, Math.min(MODULES.length - 1, Math.round(offset / width)));
    if (nextIndex === activeIndex) return;

    setActiveIndex(nextIndex);
    pulseScale.value = withSequence(
      withTiming(theme.paginador.escalaPulso, { duration: theme.paginador.duracionPulso / 2 }),
      withTiming(1, { duration: theme.paginador.duracionPulso / 2 }),
    );
    setVisibleTitle(MODULE_TITLES[nextIndex]);
    labelOpacity.value = withTiming(1, { duration: theme.paginador.duracionEntradaEtiqueta });
    if (labelTimeout.current) clearTimeout(labelTimeout.current);
    labelTimeout.current = setTimeout(() => {
      labelOpacity.value = withTiming(0, { duration: theme.paginador.duracionSalidaEtiqueta });
      labelTimeout.current = null;
    }, theme.paginador.duracionVisibleEtiqueta);
  };

  const renderModule = useCallback(({ item }: { item: ScreenName }) => (
    <View style={[styles.page, { width, height }]}>
      {item === 'home' ? (
        <HomeScreen game={game} onNavigate={scrollToModule} />
      ) : item === 'quests' ? (
        <QuestsScreen game={game} onUpdate={onUpdate} />
      ) : item === 'character' ? (
        <CharacterScreen game={game} />
      ) : (
        <AchievementsScreen game={game} />
      )}
    </View>
  ), [game, height, onUpdate, scrollToModule, width]);

  useEffect(() => {
    let mounted = true;
    let nudgeTimeout: ReturnType<typeof setTimeout> | null = null;
    let returnTimeout: ReturnType<typeof setTimeout> | null = null;

    const showDiscoveryHint = async () => {
      try {
        const hasSeenHint = await AsyncStorage.getItem(HINT_STORAGE_KEY);
        if (!mounted || hasSeenHint !== null) return;

        await AsyncStorage.setItem(HINT_STORAGE_KEY, 'shown');
        if (!mounted) return;

        nudgeTimeout = setTimeout(() => {
          if (!mounted) return;
          listRef.current?.scrollToOffset({ offset: theme.paginador.distanciaPista, animated: true });
          hintPulseScale.value = withRepeat(
            withSequence(
              withTiming(theme.paginador.escalaPista, { duration: theme.paginador.duracionEntradaPista }),
              withTiming(1, { duration: theme.paginador.duracionSalidaPista }),
            ),
            2,
            false,
          );
          returnTimeout = setTimeout(() => {
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
          }, theme.paginador.demoraRegresoPista);
        }, theme.paginador.demoraPista);
      } catch {
        if (mounted) setHintError(strings.loading.navigationHintError);
      }
    };

    void showDiscoveryHint();
    return () => {
      mounted = false;
      if (nudgeTimeout) clearTimeout(nudgeTimeout);
      if (returnTimeout) clearTimeout(returnTimeout);
      if (labelTimeout.current) clearTimeout(labelTimeout.current);
      cancelAnimation(pulseScale);
      cancelAnimation(hintPulseScale);
      cancelAnimation(labelOpacity);
    };
  }, [hintPulseScale, labelOpacity, pulseScale]);

  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOpacity.value }));

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={listRef}
        data={MODULES}
        renderItem={renderModule}
        keyExtractor={(item) => item}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialNumToRender={MODULES.length}
        maxToRenderPerBatch={MODULES.length}
        windowSize={MODULES.length + 1}
        removeClippedSubviews={false}
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        directionalLockEnabled
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={(event) => showModuleTitle(event.nativeEvent.contentOffset.x)}
        onScrollEndDrag={(event) => showModuleTitle(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        style={styles.pager}
      />

      <View
        pointerEvents="none"
        style={[
          styles.bottomReserve,
          { height: height * theme.paginador.franjaInferior },
        ]}
      />

      <View
        pointerEvents="box-none"
        style={[styles.indicatorOverlay, { bottom: height * theme.paginador.margenInferior }]}
      >
        <Animated.Text pointerEvents="none" style={[styles.moduleLabel, labelStyle]}>
          {visibleTitle}
        </Animated.Text>
        <View style={styles.indicators}>
          {MODULES.map((module, index) => (
            <ModuleDot
              key={module}
              index={index}
              activeIndex={activeIndex}
              scrollX={scrollX}
              pulseScale={pulseScale}
              hintPulseScale={hintPulseScale}
              pageWidth={width}
              onPress={() => scrollToModule(module)}
            />
          ))}
        </View>
      </View>

      {hintError ? (
        <View accessibilityRole="alert" style={styles.hintError}>
          <Text style={styles.hintErrorText}>{hintError}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ModuleDot({
  index,
  activeIndex,
  scrollX,
  pulseScale,
  hintPulseScale,
  pageWidth,
  onPress,
}: {
  index: number;
  activeIndex: number;
  scrollX: SharedValue<number>;
  pulseScale: SharedValue<number>;
  hintPulseScale: SharedValue<number>;
  pageWidth: number;
  onPress: () => void;
}) {
  const isEdge = index === 0 || index === MODULES.length - 1;
  const inputRange = index === 0
    ? [0, 1]
    : index === MODULES.length - 1
      ? [MODULES.length - 2, MODULES.length - 1]
      : [index - 1, index, index + 1];
  const outputRange = index === 0 ? [1, 0] : index === MODULES.length - 1 ? [0, 1] : [0, 1, 0];
  const animatedDotStyle = useAnimatedStyle(() => {
    const pagePosition = scrollX.value / pageWidth;
    const focus = interpolate(pagePosition, inputRange, outputRange, 'clamp');
    return {
      width: interpolate(focus, [0, 1], [theme.paginador.punto, theme.paginador.puntoActivoAncho]),
      height: theme.paginador.punto,
      backgroundColor: interpolateColor(
        focus,
        [0, 1],
        [MODULE_INACTIVE_ACCENTS[index], MODULE_ACCENTS[index]],
      ),
      borderColor: theme.fondo,
    };
  }, [pageWidth]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: activeIndex === index ? pulseScale.value : 1 }],
  }), [activeIndex, index, pulseScale]);
  const hintPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: index === 1 ? hintPulseScale.value : 1 }],
  }), [hintPulseScale, index]);

  return (
    <Pressable
      accessibilityLabel={`Ir a ${MODULE_TITLES[index]}`}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeIndex === index }}
      onPress={onPress}
      style={[
        styles.dotTouch,
        isEdge && { transform: [{ translateY: -theme.paginador.elevacionExtremos }] },
      ]}
    >
      <Animated.View style={pulseStyle}>
        <Animated.View style={hintPulseStyle}>
          <Animated.View style={[styles.dot, animatedDotStyle]} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fondo },
  pager: { flex: 1, backgroundColor: theme.fondo },
  page: { flex: 1 },
  bottomReserve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.fondo,
  },
  indicatorOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
  },
  moduleLabel: {
    color: theme.texto,
    ...theme.tipografia.etiqueta,
    position: 'absolute',
    bottom: theme.paginador.zonaTactil + theme.espaciado.pequeno,
    alignSelf: 'center',
    textAlign: 'center',
  },
  indicators: { flexDirection: 'row', alignItems: 'center', gap: theme.paginador.separacionPuntos },
  dotTouch: {
    width: theme.paginador.zonaTactil,
    height: theme.paginador.zonaTactil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: theme.paginador.punto,
    height: theme.paginador.punto,
    borderWidth: theme.paginador.aroAncho,
    borderColor: theme.fondo,
    borderRadius: theme.radios.punto,
  },
  hintError: {
    position: 'absolute',
    top: theme.espaciado.superiorMensajeError,
    alignSelf: 'center',
    width: theme.espaciado.anchoMensajeError,
  },
  hintErrorText: {
    color: theme.acentos.misiones,
    ...theme.tipografia.etiqueta,
    padding: theme.espaciado.base,
    textAlign: 'center',
  },
});
