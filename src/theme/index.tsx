import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DarkThemeColors, LightThemeColors, ThemeColors } from './colors';
import { Typography, FontSize, FontWeight, LineHeight } from './typography';
import { Spacing, Layout } from './spacing';
import { Shadows } from './shadows';
import { Radius } from './radius';

export interface Theme {
  colors: ThemeColors;
  typography: typeof Typography;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  lineHeight: typeof LineHeight;
  spacing: typeof Spacing;
  layout: typeof Layout;
  shadows: typeof Shadows;
  radius: typeof Radius;
  isDark: boolean;
}

const buildTheme = (isDark: boolean): Theme => ({
  colors: isDark ? DarkThemeColors : LightThemeColors,
  typography: Typography,
  fontSize: FontSize,
  fontWeight: FontWeight,
  lineHeight: LineHeight,
  spacing: Spacing,
  layout: Layout,
  shadows: Shadows,
  radius: Radius,
  isDark,
});

const ThemeContext = createContext<Theme>(buildTheme(true));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';

  const theme = useMemo(() => buildTheme(isDark), [isDark]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

// Re-exports for convenience
export { DarkThemeColors, LightThemeColors } from './colors';
export { Typography, FontSize, FontWeight, LineHeight } from './typography';
export { Spacing, Layout } from './spacing';
export { Shadows } from './shadows';
export { Radius } from './radius';
export type { ThemeColors } from './colors';
