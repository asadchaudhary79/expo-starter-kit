import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import { createContext, useContext, useMemo } from 'react';

import { colors } from '@/theme/colors';
import { motion } from '@/theme/motion';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { fonts, typography } from '@/theme/typography';

export type ThemeMode = 'light';
export type ResolvedTheme = 'light';

type AppThemeContextValue = {
  colors: (typeof colors)['light'];
  fonts: typeof fonts;
  isReady: boolean;
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  motion: typeof motion;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  const value = useMemo(
    () => ({
      colors: colors.light,
      fonts,
      isReady: fontsLoaded || Boolean(fontError),
      mode: 'light' as const,
      resolvedTheme: 'light' as const,
      motion,
      radius,
      spacing,
      typography,
    }),
    [fontError, fontsLoaded],
  );

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: value.colors.background,
      border: value.colors.border,
      card: value.colors.surface,
      notification: value.colors.primary,
      primary: value.colors.primary,
      text: value.colors.text,
    },
  };

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return value;
}
