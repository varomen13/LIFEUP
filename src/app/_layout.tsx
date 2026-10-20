import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { GameProvider, useGame } from '../context/GameContext';
import { theme } from '../constants/theme';
import { strings } from '../constants/strings';

void SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  console.error('No se pudo mantener visible la pantalla de carga.', error);
});

function AppNavigation() {
  const { game, storageError } = useGame();

  if (!game) {
    return (
      <View style={styles.loading}>
        {storageError ? (
          <Text style={styles.error}>{storageError}</Text>
        ) : (
          <ActivityIndicator color={theme.acentos.inicio} />
        )}
        <Text style={styles.loadingText}>
          {storageError ? strings.loading.unchanged : strings.loading.preparing}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.fondo },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="quests" />
        <Stack.Screen name="character" />
        <Stack.Screen name="achievements" />
      </Stack>
      {storageError ? (
        <View accessibilityRole="alert" style={styles.errorBanner}>
          <Text style={styles.error}>{storageError}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensedSemiBold: require('../../assets/fonts/BarlowCondensed-SemiBold.ttf'),
    BarlowCondensedRegular: require('../../assets/fonts/BarlowCondensed-Regular.ttf'),
    BarlowCondensedMedium: require('../../assets/fonts/BarlowCondensed-Medium.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    SplashScreen.hideAsync().catch((error: unknown) => {
      console.error('No se pudo ocultar la pantalla de carga.', error);
    });
  }, [fontError, fontsLoaded]);

  if (fontError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.error}>No se pudieron cargar las fuentes de LIFEUP.</Text>
      </View>
    );
  }
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.acentos.inicio} />
        <Text style={styles.loadingText}>{strings.loading.preparing}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <AppNavigation />
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: theme.fondo },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.espaciado.medio, paddingHorizontal: theme.espaciado.margenCargaHorizontal, backgroundColor: theme.fondo },
  loadingText: { color: theme.textoSecundario, ...theme.tipografia.cuerpo, textAlign: 'center' },
  error: { color: theme.acentos.misiones, ...theme.tipografia.etiqueta, textAlign: 'center', padding: theme.espaciado.base },
  errorBanner: {
    width: theme.espaciado.anchoMensajeError,
    alignSelf: 'center',
    position: 'absolute',
    top: theme.espaciado.superiorMensajeError,
    zIndex: 1,
  },
});
