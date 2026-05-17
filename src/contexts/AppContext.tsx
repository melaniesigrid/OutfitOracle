import React, { createContext, useContext, ReactNode, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useOracle } from '../hooks/useOracle';
import { useStyleProfile } from '../hooks/useStyleProfile';
import { useOutfitHistory } from '../hooks/useOutfitHistory';
import { useConsultStreak } from '../hooks/useConsultStreak';
import { useSavedOutfits } from '../hooks/useSavedOutfits';
import { useWeatherBadges, WeatherBadge } from '../hooks/useWeatherBadges';
import { useOracleImage, OracleImageState } from '../hooks/useOracleImage';
import { useArchive } from '../hooks/useArchive';

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
  oracleImages: {
    day: OracleImageState;
    night: OracleImageState;
    daySketch: OracleImageState;
    nightSketch: OracleImageState;
  };
  archiveCtx: ReturnType<typeof useArchive>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const oracle     = useOracle(CLAUDE_API_KEY);
  const profileCtx = useStyleProfile();
  const historyCtx = useOutfitHistory();
  const streakCtx  = useConsultStreak();
  const savedCtx   = useSavedOutfits();
  const archiveCtx = useArchive();

  // Only the day variant auto-generates eagerly. Night/sketch variants are on-demand
  // (autoGenerate=false) to avoid 4× sequential fal.ai fetches (~$0.20-0.32) on every consult.
  const dayImageState         = useOracleImage(oracle.status, oracle.verdict ?? null, oracle.weather ?? null, oracle.isFromCache, 'day',         oracle.gender, oracle.occasion, profileCtx.profile ?? undefined, true);
  const nightImageState       = useOracleImage(oracle.status, oracle.verdict ?? null, oracle.weather ?? null, oracle.isFromCache, 'night',       oracle.gender, oracle.occasion, profileCtx.profile ?? undefined, false);
  const daySketchImageState   = useOracleImage(oracle.status, oracle.verdict ?? null, oracle.weather ?? null, oracle.isFromCache, 'daySketch',   oracle.gender, oracle.occasion, profileCtx.profile ?? undefined, false);
  const nightSketchImageState = useOracleImage(oracle.status, oracle.verdict ?? null, oracle.weather ?? null, oracle.isFromCache, 'nightSketch', oracle.gender, oracle.occasion, profileCtx.profile ?? undefined, false);

  const badges = useWeatherBadges(
    historyCtx.history,
    historyCtx.firstConsultAt,
    { totalConsults: streakCtx.totalConsults, streak: streakCtx.streak, savedCount: savedCtx.saved.length },
  );

  const prevEarnedRef  = useRef<Set<string>>(new Set());
  const badgesHydratedRef = useRef(false);
  const [newBadgeQueue, setNewBadgeQueue] = useState<WeatherBadge[]>([]);

  useEffect(() => {
    if (!historyCtx.historyLoaded || !streakCtx.streakLoaded || !savedCtx.savedLoaded) return;

    const currentEarned = new Set(badges.filter(b => b.earned).map(b => b.id));

    if (!badgesHydratedRef.current) {
      prevEarnedRef.current = currentEarned;
      badgesHydratedRef.current = true;
      return;
    }

    const newly = badges.filter(b => b.earned && !prevEarnedRef.current.has(b.id));
    prevEarnedRef.current = currentEarned;
    if (newly.length > 0) setNewBadgeQueue(prev => [...prev, ...newly]);
  }, [badges, historyCtx.historyLoaded, savedCtx.savedLoaded, streakCtx.streakLoaded]);

  const dismissBadgeToast = useCallback(() => setNewBadgeQueue(prev => prev.slice(1)), []);

  const contextValue = useMemo(
    () => ({
      oracle,
      profileCtx,
      historyCtx,
      streakCtx,
      savedCtx,
      archiveCtx,
      badges,
      newBadgeQueue,
      dismissBadgeToast,
      oracleImages: {
        day: dayImageState,
        night: nightImageState,
        daySketch: daySketchImageState,
        nightSketch: nightSketchImageState,
      },
    }),
    [oracle, profileCtx, historyCtx, streakCtx, savedCtx, archiveCtx, badges, newBadgeQueue, dismissBadgeToast, dayImageState, nightImageState, daySketchImageState, nightSketchImageState],
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
