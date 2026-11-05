import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { getPaletteForScheme, type ColorScheme, type ColorTheme, type RcsPalette } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colorTheme: ColorTheme;
  palette: Record<keyof RcsPalette, string>;
  storageError: string | null;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
};

const MODE_STORAGE_KEY = 'rcs-app-theme-mode';
const COLOR_THEME_STORAGE_KEY = 'rcs-app-color-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('classic');
  const colorScheme = mode;
  const palette = useMemo(() => getPaletteForScheme(colorScheme, colorTheme), [colorScheme, colorTheme]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      AsyncStorage.getItem(MODE_STORAGE_KEY),
      AsyncStorage.getItem(COLOR_THEME_STORAGE_KEY),
    ])
      .then(([storedMode, storedColorTheme]) => {
        if (!mounted) return;
        if (storedMode === 'light' || storedMode === 'dark') {
          setModeState(storedMode);
        }
        if (storedColorTheme && isColorTheme(storedColorTheme)) {
          setColorThemeState(storedColorTheme);
        }
        setIsReady(true);
      })
      .catch((error: unknown) => {
        console.error('Unable to load saved theme preference.', error);
        if (mounted) {
          setStorageError('Could not load your saved theme preference.');
          setIsReady(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    setStorageError(null);
    AsyncStorage.setItem(MODE_STORAGE_KEY, nextMode).catch((error: unknown) => {
      console.error('Unable to save theme preference.', error);
      setStorageError('Theme changed, but your preference could not be saved.');
    });
  }, []);

  const setColorTheme = useCallback((nextTheme: ColorTheme) => {
    setColorThemeState(nextTheme);
    setStorageError(null);
    AsyncStorage.setItem(COLOR_THEME_STORAGE_KEY, nextTheme).catch((error: unknown) => {
      console.error('Unable to save color theme preference.', error);
      setStorageError('Color theme changed, but your preference could not be saved.');
    });
  }, []);

  const value = useMemo(
    () => ({ mode, colorScheme, colorTheme, palette, storageError, setMode, setColorTheme }),
    [mode, colorScheme, colorTheme, palette, storageError, setMode, setColorTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {isReady ? children : null}
    </ThemeContext.Provider>
  );
}

function isColorTheme(value: string): value is ColorTheme {
  return value === 'classic' || value === 'ocean' || value === 'forest' || value === 'violet' || value === 'sunset';
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within AppThemeProvider.');
  return context;
}
