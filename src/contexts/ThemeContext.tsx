import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, AppColors, AppFonts, THEMES, getThemeTokens, isY2KTheme } from '../theme';
import { Y2KFontSubtheme, getY2KFontSet } from '../theme/y2kTypography';

const THEME_KEY         = '@outfit_oracle_theme';
const Y2K_SUBTHEME_KEY  = '@outfit_oracle_y2k_font_subtheme';

interface ThemeContextValue {
  themeName: ThemeName;
  colors: AppColors;
  fonts: AppFonts;
  isDark: boolean;
  setTheme: (name: ThemeName) => void;
  /** Only meaningful when themeName === 'y2k' */
  y2kFontSubtheme: Y2KFontSubtheme;
  setY2KFontSubtheme: (s: Y2KFontSubtheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName]           = useState<ThemeName>('classic');
  const [y2kFontSubtheme, setSubthemeState] = useState<Y2KFontSubtheme>('club');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(Y2K_SUBTHEME_KEY),
    ]).then(([storedTheme, storedSubtheme]) => {
      if (storedTheme && storedTheme in THEMES) setThemeName(storedTheme as ThemeName);
      if (storedSubtheme === 'club' || storedSubtheme === 'decree') {
        setSubthemeState(storedSubtheme);
      }
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(THEME_KEY, name).catch(() => {});
  }, []);

  const setY2KFontSubtheme = useCallback((s: Y2KFontSubtheme) => {
    setSubthemeState(s);
    AsyncStorage.setItem(Y2K_SUBTHEME_KEY, s).catch(() => {});
  }, []);

  const { colors, fonts: baseFont, isDark } = getThemeTokens(themeName);

  // For Y2K theme, substitute font families from the active subtheme
  const fonts: AppFonts = useMemo(() => {
    if (!isY2KTheme(themeName)) return baseFont;
    const f = getY2KFontSet(y2kFontSubtheme);
    return {
      ...baseFont,
      display:      f.display,
      displayBold:  f.display,
      displayLight: f.displaySub,
      serif:        f.editorialItalic,
      mono:         f.mono,
      monoMedium:   f.monoMedium,
    };
  }, [themeName, baseFont, y2kFontSubtheme]);

  const value = useMemo(
    () => ({ themeName, colors, fonts, isDark, setTheme, y2kFontSubtheme, setY2KFontSubtheme }),
    [themeName, colors, fonts, isDark, setTheme, y2kFontSubtheme, setY2KFontSubtheme],
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
