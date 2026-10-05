/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const RcsColors = {
  yellow: '#E7B83F',
  yellowLight: '#FFF4D3',
  yellowDeep: '#C89519',
  brown: '#694522',
  brownDark: '#432E1D',
  brownLight: '#8A6338',
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

export const Colors = {
  light: {
    text: RcsColors.text,
    background: RcsColors.background,
    backgroundElement: RcsColors.grayLight,
    backgroundSelected: RcsColors.yellowLight,
    textSecondary: RcsColors.mutedText,
  },
  dark: {
    text: RcsColors.white,
    background: RcsColors.brownDark,
    backgroundElement: RcsColors.grayDark,
    backgroundSelected: RcsColors.brown,
    textSecondary: '#D2C8B9',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
