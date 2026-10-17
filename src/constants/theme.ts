import '@/global.css';

import { Platform } from 'react-native';

const lightPalette = {
  yellow: '#E5B638',
  yellowLight: '#F8EDCD',
  yellowDeep: '#8D650A',
  brown: '#C52A31',
  brownDark: '#292725',
  brownLight: '#9B242B',
  brownSurface: '#292725',
  danger: '#B42318',
  gray: '#6B6761',
  grayDark: '#383633',
  grayMuted: '#777169',
  grayLight: '#EEE9DF',
  background: '#F4F0E7',
  surface: '#FFFDFA',
  border: '#DED6C8',
  text: '#292725',
  mutedText: '#6F6961',
  white: '#FFFFFF',
} as const;

const darkPalette: Record<keyof typeof lightPalette, string> = {
  yellow: '#E8BC51',
  yellowLight: '#393329',
  yellowDeep: '#F2D17B',
  brown: '#B8463F',
  brownDark: '#F0E9DD',
  brownLight: '#EA958A',
  brownSurface: '#2C2925',
  danger: '#F18A80',
  gray: '#C9C2B7',
  grayDark: '#E5DED3',
  grayMuted: '#AAA297',
  grayLight: '#302D29',
  background: '#181817',
  surface: '#22211F',
  border: '#3D3933',
  text: '#F2EEE6',
  mutedText: '#B9B1A5',
  white: '#FFFDF8',
};

export type RcsPalette = typeof lightPalette;
export type ColorScheme = 'light' | 'dark';

export function getPaletteForScheme(scheme: ColorScheme): Record<keyof RcsPalette, string> {
  return scheme === 'dark' ? darkPalette : lightPalette;
}

export const Colors = {
  light: {
    text: lightPalette.text,
    background: lightPalette.background,
    backgroundElement: lightPalette.grayLight,
    backgroundSelected: lightPalette.yellowLight,
    textSecondary: lightPalette.mutedText,
  },
  dark: {
    text: darkPalette.text,
    background: darkPalette.background,
    backgroundElement: darkPalette.grayLight,
    backgroundSelected: darkPalette.yellowLight,
    textSecondary: darkPalette.mutedText,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
