import React, { createContext, useContext, ReactNode, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useOracle } from '../hooks/useOracle';
import { useStyleProfile } from '../hooks/useStyleProfile';
import { useOutfitHistory } from '../hooks/useOutfitHistory';
import { useConsultStreak } from '../hooks/useConsultStreak';
import { useSavedOutfits } from '../hooks/useSavedOutfits';
import { useWeatherBadges, WeatherBadge } from '../hooks/useWeatherBadges';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';

type AppContextValue = {
  oracle: ReturnType<typeof useOracle>;
  profileCtx: ReturnType<typeof useStyleProfile>;
  historyCtx: ReturnType<typeof useOutfitHistory>;
  streakCtx: ReturnType<typeof useConsultStreak>;
  savedCtx: ReturnType<typeof useSavedOutfits>;
  badges: WeatherBadge[];
  newBadgeQueue: WeatherBadge[];
  dismissBadgeToast: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const oracle     = useOracle(CLAUDE_API_KEY);
  const profileCtx = useStyleProfile();
  const historyCtx = useOutfitHistory();
  const streakCtx  = useConsultStreak();
  const savedCtx   = useSavedOutfits();

  const badges = useWeatherBadges(
    historyCtx.history,
    historyCtx.firstConsultAt,
    { totalConsults: streakCtx.totalConsults, streak: streakCtx.streak, savedCount: savedCtx.saved.length },
  );

  const prevEarnedRef  = useRef<Set<string>>(new Set());
  const [newBadgeQueue, setNewBadgeQueue] = useState<WeatherBadge[]>([]);

  useEffect(() => {
    if (!historyCtx.historyLoaded) return;
    const currentEarned = new Set(badges.filter(b => b.earned).map(b => b.id));
    const newly = badges.filter(b => b.earned && !prevEarnedRef.current.has(b.id));
    prevEarnedRef.current = currentEarned;
    if (newly.length > 0) setNewBadgeQueue(prev => [...prev, ...newly]);
  }, [badges, historyCtx.historyLoaded]);

  const dismissBadgeToast = useCallback(() => setNewBadgeQueue(prev => prev.slice(1)), []);

  const contextValue = useMemo(
    () => ({ oracle, profileCtx, historyCtx, streakCtx, savedCtx, badges, newBadgeQueue, dismissBadgeToast }),
    [oracle, profileCtx, historyCtx, streakCtx, savedCtx, badges, newBadgeQueue, dismissBadgeToast],
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
