// src/theme/colors.ts

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceGlass: string;
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
  tealGlow: string;
  gold: string;
  goldSoft: string;
  goldGlow: string;
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
  surfaceGlass: 'rgba(0, 0, 0, 0.03)',
  text: '#1C1917',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',
  border: 'rgba(0, 0, 0, 0.07)',
  borderStrong: 'rgba(0, 0, 0, 0.15)',

  red: '#B91C1C',
  redSoft: '#FEF2F2',
  teal: '#0F766E',
  tealSoft: '#F0FDFA',
  tealGlow: 'rgba(15, 118, 110, 0.10)',
  gold: '#A16207',
  goldSoft: '#FEFCE8',
  goldGlow: 'rgba(161, 98, 7, 0.10)',
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
  background: '#141210',
  surface: '#1E1C1A',
  surfaceAlt: '#2A2724',
  surfaceGlass: 'rgba(255, 255, 255, 0.04)',
  text: '#F5F0EB',
  textSecondary: '#A8A29E',
  textMuted: '#6B6560',
  border: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',

  red: '#F87171',
  redSoft: '#3B1111',
  teal: '#2DD4BF',
  tealSoft: '#0D2D2A',
  tealGlow: 'rgba(45, 212, 191, 0.14)',
  gold: '#FCD34D',
  goldSoft: '#2D2306',
  goldGlow: 'rgba(252, 211, 77, 0.14)',
  blue: '#60A5FA',
  blueSoft: '#0C1A33',
  green: '#34D399',
  greenSoft: '#0D2818',

  success: '#34D399',
  error: '#F87171',
  warning: '#FCD34D',

  characterStroke: '#F5F0EB',
  characterOutline: '#3A3633',
  characterDrawing: '#F87171',
  characterHighlight: '#FCD34D',
};
