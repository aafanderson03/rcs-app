import '@/global.css';

import { Platform } from 'react-native';

const lightPalette = {
  yellow: '#E9B646',
  yellowLight: '#FFF0CA',
  yellowDeep: '#936309',
  brown: '#B3262D',
  brownDark: '#292725',
  brownLight: '#8F2027',
  brownSurface: '#292725',
  holidayBackground: '#B42318',
  holidayForeground: '#FFFFFF',
  todayHighlightText: '#5A4314',
  sidebar: '#F5E9D1',
  danger: '#B42318',
  gray: '#716D67',
  grayDark: '#383633',
  grayMuted: '#77736D',
  grayLight: '#F2EADC',
  background: '#F4EFE7',
  surface: '#FFFCF7',
  border: '#E4D9C8',
  text: '#292725',
  mutedText: '#6F6961',
  white: '#FFFFFF',
} as const;

const darkPalette: Record<keyof typeof lightPalette, string> = {
  yellow: '#E9B646',
  yellowLight: '#393329',
  yellowDeep: '#F2D17B',
  brown: '#D9565B',
  brownDark: '#F0E9DD',
  brownLight: '#EA958A',
  brownSurface: '#2C2925',
  holidayBackground: '#8F2027',
  holidayForeground: '#FFFDF8',
  todayHighlightText: '#5A4314',
  sidebar: '#211F1C',
  danger: '#F18A80',
  gray: '#C9C2B7',
  grayDark: '#E5DED3',
  grayMuted: '#AAA297',
  grayLight: '#302D29',
  background: '#171716',
  surface: '#22211F',
  border: '#3D3933',
  text: '#F2EEE6',
  mutedText: '#B9B1A5',
  white: '#FFFDF8',
};

export type RcsPalette = typeof lightPalette;
export type ColorScheme = 'light' | 'dark';
export const COLOR_THEMES = [
  { id: 'classic', label: 'RCS Classic', primary: '#B3262D', secondary: '#E9B646' },
  { id: 'ocean', label: 'Ocean', primary: '#176B87', secondary: '#58B9D2' },
  { id: 'forest', label: 'Forest', primary: '#397347', secondary: '#A6C76A' },
  { id: 'violet', label: 'Violet', primary: '#7352A3', secondary: '#C2A3ED' },
  { id: 'sunset', label: 'Sunset', primary: '#BD542F', secondary: '#F0A35E' },
] as const;

export type ColorTheme = typeof COLOR_THEMES[number]['id'];

const themeAccents: Record<ColorTheme, {
  light: { primary: string; primaryLight: string; secondary: string; selected: string; secondaryDeep: string };
  dark: { primary: string; primaryLight: string; secondary: string; selected: string; secondaryDeep: string };
}> = {
  classic: {
    light: { primary: '#B3262D', primaryLight: '#8F2027', secondary: '#E9B646', selected: '#FFF0CA', secondaryDeep: '#936309' },
    dark: { primary: '#D9565B', primaryLight: '#EA958A', secondary: '#E9B646', selected: '#393329', secondaryDeep: '#F2D17B' },
  },
  ocean: {
    light: { primary: '#176B87', primaryLight: '#13556C', secondary: '#58B9D2', selected: '#DDF3F7', secondaryDeep: '#175D70' },
    dark: { primary: '#61C6DA', primaryLight: '#88D6E4', secondary: '#58B9D2', selected: '#203940', secondaryDeep: '#A3E5EF' },
  },
  forest: {
    light: { primary: '#397347', primaryLight: '#2E603B', secondary: '#A6C76A', selected: '#EAF2DC', secondaryDeep: '#567B2A' },
    dark: { primary: '#7DBA83', primaryLight: '#A1D3A5', secondary: '#A6C76A', selected: '#2B3828', secondaryDeep: '#C0DF8D' },
  },
  violet: {
    light: { primary: '#7352A3', primaryLight: '#603F91', secondary: '#C2A3ED', selected: '#F0E7FC', secondaryDeep: '#62428F' },
    dark: { primary: '#B79AE5', primaryLight: '#D0B9F2', secondary: '#A98AD8', selected: '#342B40', secondaryDeep: '#D2B9F6' },
  },
  sunset: {
    light: { primary: '#BD542F', primaryLight: '#984124', secondary: '#F0A35E', selected: '#FCEBDD', secondaryDeep: '#985123' },
    dark: { primary: '#F08C68', primaryLight: '#F4AD8C', secondary: '#E89A55', selected: '#402D27', secondaryDeep: '#F8C48C' },
  },
};

export function getPaletteForScheme(
  scheme: ColorScheme,
  colorTheme: ColorTheme = 'classic',
): Record<keyof RcsPalette, string> {
  const palette = scheme === 'dark' ? darkPalette : lightPalette;
  const accent = themeAccents[colorTheme][scheme];
  return {
    ...palette,
    brown: accent.primary,
    brownLight: accent.primaryLight,
    yellow: accent.secondary,
    yellowLight: accent.selected,
    yellowDeep: accent.secondaryDeep,
    todayHighlightText: accent.secondaryDeep,
  };
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
    sans: 'Montserrat_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Montserrat_400Regular',
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
