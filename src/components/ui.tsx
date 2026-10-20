import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TextProps, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export function Page({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.pageContent,
        {
          width: width * theme.espaciado.paginaAncho,
          paddingTop: Math.max(height * theme.espaciado.paginaSuperior, insets.top),
          paddingBottom: Math.max(height * theme.espaciado.paginaInferior, insets.bottom),
        },
      ]}
      directionalLockEnabled
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function AppText({ children, style, ...props }: TextProps) {
  return (
    <Text {...props} style={[theme.tipografia.cuerpo, style]}>
      {children}
    </Text>
  );
}

export function Label({ children, style, ...props }: TextProps) {
  return (
    <Text {...props} style={[theme.tipografia.etiqueta, styles.label, style]}>
      {children}
    </Text>
  );
}

export function Rule() {
  return <View accessible={false} style={styles.rule} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.fondo },
  pageContent: {
    alignSelf: 'center',
    gap: theme.espaciado.medio,
  },
  label: { color: theme.textoSecundario },
  rule: { height: theme.espaciado.altoSeparador, backgroundColor: theme.linea },
});
