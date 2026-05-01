// src/theme/typography.ts

import { Platform } from 'react-native';

// Font families
// Note: Noto Serif TC must be loaded via expo-font or expo-google-fonts
// These are fallback-safe values — the app works with system fonts initially
export const fonts = {
  /** Large character display — use the heaviest serif available */
  character: Platform.select({
    ios: 'PingFang TC',
    android: 'Noto Serif CJK TC',
    default: 'serif',
  }),
  /** UI body text — clean sans-serif */
  body: Platform.select({
    ios: 'PingFang TC',
    android: 'Noto Sans CJK TC',
    default: 'System',
  }),
  /** Monospace for numbers, stats, codes */
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Font sizes — use these everywhere for consistency
export const fontSize = {
  /** 10px — tiny labels, badges */
  xs: 10,
  /** 11px — sub-labels, pinyin */
  sm: 11,
  /** 12px — secondary text, captions */
  caption: 12,
  /** 13px — descriptions */
  desc: 13,
  /** 14px — body text */
  body: 14,
  /** 16px — large body, card titles */
  lg: 16,
  /** 18px — section headers, example words */
  xl: 18,
  /** 20px — screen subtitles */
  xxl: 20,
  /** 22px — screen titles */
  title: 22,
  /** 28px — section headers, week topics */
  heading: 28,
  /** 30px — character in grid cell */
  charGrid: 30,
  /** 36px — stat numbers */
  stat: 36,
  /** 56px — month numbers */
  monthNum: 56,
  /** 64px — practice character */
  charPractice: 64,
  /** 88px — character detail hero */
  charHero: 88,
} as const;

// Font weights (React Native uses string values)
export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

// Line heights
export const lineHeight = {
  tight: 1.15,
  normal: 1.5,
  relaxed: 1.65,
  loose: 1.8,
};
