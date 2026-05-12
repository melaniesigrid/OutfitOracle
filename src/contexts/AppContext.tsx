import React, { createContext, useContext, ReactNode } from 'react';
import { useOracle } from '../hooks/useOracle';
import { useStyleProfile } from '../hooks/useStyleProfile';
import { useOutfitHistory } from '../hooks/useOutfitHistory';
import { useConsultStreak } from '../hooks/useConsultStreak';
import { useSavedOutfits } from '../hooks/useSavedOutfits';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';

type AppContextValue = {
  oracle: ReturnType<typeof useOracle>;
  profileCtx: ReturnType<typeof useStyleProfile>;
  historyCtx: ReturnType<typeof useOutfitHistory>;
  streakCtx: ReturnType<typeof useConsultStreak>;
  savedCtx: ReturnType<typeof useSavedOutfits>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const oracle     = useOracle(CLAUDE_API_KEY);
  const profileCtx = useStyleProfile();
  const historyCtx = useOutfitHistory();
  const streakCtx  = useConsultStreak();
  const savedCtx   = useSavedOutfits();

  return (
    <AppContext.Provider value={{ oracle, profileCtx, historyCtx, streakCtx, savedCtx }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
