import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, AppColors, AppFonts, getThemeTokens } from '../theme';

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
      if (stored === 'classic' || stored === 'editorial-light' || stored === 'editorial-dark') {
        setThemeName(stored);
      }
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(THEME_KEY, name);
  }, []);

  const { colors, fonts, isDark } = getThemeTokens(themeName);

  return (
    <ThemeContext.Provider value={{ themeName, colors, fonts, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
