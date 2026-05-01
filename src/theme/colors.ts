// src/theme/colors.ts

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;

  // Accents
  red: string;
  redSoft: string;
  teal: string;
  tealSoft: string;
  gold: string;
  goldSoft: string;
  blue: string;
  blueSoft: string;
  green: string;
  greenSoft: string;

  // Semantic
  success: string;
  error: string;
  warning: string;

  // Special
  characterStroke: string;
  characterOutline: string;
  characterDrawing: string;
  characterHighlight: string;
}

export const lightColors: ColorPalette = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F0ECE4',
  text: '#1C1917',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',
  border: 'rgba(0, 0, 0, 0.07)',
  borderStrong: 'rgba(0, 0, 0, 0.15)',

  red: '#B91C1C',
  redSoft: '#FEF2F2',
  teal: '#0F766E',
  tealSoft: '#F0FDFA',
  gold: '#A16207',
  goldSoft: '#FEFCE8',
  blue: '#1D4ED8',
  blueSoft: '#EFF6FF',
  green: '#15803D',
  greenSoft: '#F0FDF4',

  success: '#15803D',
  error: '#B91C1C',
  warning: '#A16207',

  characterStroke: '#1C1917',
  characterOutline: '#D6D3D1',
  characterDrawing: '#B91C1C',
  characterHighlight: '#FACC15',
};

export const darkColors: ColorPalette = {
  background: '#1C1917',
  surface: '#292524',
  surfaceAlt: '#44403C',
  text: '#FAF8F5',
  textSecondary: '#A8A29E',
  textMuted: '#78716C',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',

  red: '#EF4444',
  redSoft: '#3B1111',
  teal: '#2DD4BF',
  tealSoft: '#0D2D2A',
  gold: '#FACC15',
  goldSoft: '#2D2306',
  blue: '#60A5FA',
  blueSoft: '#0C1A33',
  green: '#4ADE80',
  greenSoft: '#0D2818',

  success: '#4ADE80',
  error: '#EF4444',
  warning: '#FACC15',

  characterStroke: '#FAF8F5',
  characterOutline: '#44403C',
  characterDrawing: '#EF4444',
  characterHighlight: '#FACC15',
};
