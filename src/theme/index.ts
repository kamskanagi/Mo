// src/theme/index.ts

import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';
import type { ColorPalette } from './colors';

export { lightColors, darkColors } from './colors';
export type { ColorPalette } from './colors';
export { fonts, fontSize, fontWeight, lineHeight } from './typography';
export { spacing, radius, shadows } from './spacing';

export interface Theme {
  colors: ColorPalette;
  isDark: boolean;
}

/**
 * Returns the active theme based on system color scheme.
 * Use this hook in every component that needs theme-aware colors.
 *
 * Usage:
 *   const { colors, isDark } = useTheme();
 *   <View style={{ backgroundColor: colors.background }}>
 */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}
