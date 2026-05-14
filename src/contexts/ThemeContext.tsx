import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, AppColors, AppFonts, THEMES, getThemeTokens } from '../theme';

const THEME_KEY = '@outfit_oracle_theme';

interface ThemeContextValue {
  themeName: ThemeName;
  colors: AppColors;
  fonts: AppFonts;
  isDark: boolean;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('classic');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(stored => {
      if (stored && stored in THEMES) setThemeName(stored as ThemeName);
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(THEME_KEY, name).catch(() => {});
  }, []);

  const { colors, fonts, isDark } = getThemeTokens(themeName);

  const value = useMemo(
    () => ({ themeName, colors, fonts, isDark, setTheme }),
    [themeName, colors, fonts, isDark, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
