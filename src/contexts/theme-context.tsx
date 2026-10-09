import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import type { ColorScheme } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  storageError: string | null;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = 'rcs-app-theme-mode';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const colorScheme = mode;
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedMode) => {
        if (!mounted) return;
        if (storedMode === 'light' || storedMode === 'dark') {
          setModeState(storedMode);
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
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch((error: unknown) => {
      console.error('Unable to save theme preference.', error);
      setStorageError('Theme changed, but your preference could not be saved.');
    });
  }, []);

  const value = useMemo(
    () => ({ mode, colorScheme, storageError, setMode }),
    [mode, colorScheme, storageError, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {isReady ? children : null}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within AppThemeProvider.');
  return context;
}
