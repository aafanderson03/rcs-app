import '@/global.css';

import { Platform } from 'react-native';

const lightPalette = {
  yellow: '#E7B83F',
  yellowLight: '#FFF4D3',
  yellowDeep: '#8A5A00',
  brown: '#694522',
  brownDark: '#432E1D',
  brownLight: '#8A6338',
  brownSurface: '#694522',
  danger: '#B42318',
  gray: '#68645F',
  grayDark: '#393632',
  grayMuted: '#827C73',
  grayLight: '#F1EFEB',
  background: '#F8F6F1',
  surface: '#FFFFFF',
  border: '#E7E1D6',
  text: '#332B24',
  mutedText: '#746D64',
  white: '#FFFFFF',
} as const;

const darkPalette: Record<keyof typeof lightPalette, string> = {
  yellow: '#F2C75C',
  yellowLight: '#4B3A1E',
  yellowDeep: '#F2C75C',
  brown: '#D6A85D',
  brownDark: '#F4EFE7',
  brownLight: '#E4C58D',
  brownSurface: '#5D442C',
  danger: '#FF9A90',
  gray: '#C2BBB0',
  grayDark: '#DED8CE',
  grayMuted: '#B2A99B',
  grayLight: '#302D29',
  background: '#171615',
  surface: '#24211D',
  border: '#484239',
  text: '#F4EFE7',
  mutedText: '#C3BBAF',
  white: '#FFFFFF',
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
