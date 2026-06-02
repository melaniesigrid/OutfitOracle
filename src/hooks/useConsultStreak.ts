import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { cloudGet, cloudPut } from '../services/cloudData';

const KEY = '@outfit_oracle_streak';

const MILESTONES = [3, 7, 14, 30, 100];

const RANK_TITLES: Array<{ min: number; title: string }> = [
  { min: 100, title: 'Front Row' },
  { min: 50,  title: 'Muse' },
  { min: 20,  title: 'Connoisseur' },
  { min: 5,   title: 'Regular' },
  { min: 1,   title: 'New Arrival' },
];

interface StreakData {
  streak: number;
  lastConsultDate: string; // YYYY-MM-DD
  totalConsults: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getRankTitle(totalConsults: number): string {
  return RANK_TITLES.find(r => totalConsults >= r.min)?.title ?? 'New Arrival';
}

export function useConsultStreak() {
  const { token } = useAuth();
  const [streak, setStreak] = useState(0);
  const [totalConsults, setTotalConsults] = useState(0);
  const [newMilestone, setNewMilestone] = useState<number | null>(null);
  const [newRank, setNewRank] = useState<string | null>(null);
  const [streakLoaded, setStreakLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) return;
      try {
        const data: StreakData = JSON.parse(raw);
        // Decay streak if more than 1 day has passed since last consult
        const current = data.lastConsultDate === today() || data.lastConsultDate === yesterday()
          ? data.streak
          : 0;
        setStreak(current);
        setTotalConsults(data.totalConsults ?? 0);
      } catch {
        AsyncStorage.removeItem(KEY);
      }
    }).finally(() => setStreakLoaded(true));
  }, []);

  // Cloud sync: prefer whichever source has more total consults
  useEffect(() => {
    if (!token) return;
    cloudGet<StreakData>('/data/streak', token).then(cloud => {
      if (!cloud) return;
      AsyncStorage.getItem(KEY).then(raw => {
        const local: StreakData = raw ? JSON.parse(raw) : { streak: 0, lastConsultDate: '', totalConsults: 0 };
        if ((cloud.totalConsults ?? 0) > (local.totalConsults ?? 0)) {
          const current = cloud.lastConsultDate === today() || cloud.lastConsultDate === yesterday()
            ? cloud.streak
            : 0;
          setStreak(current);
          setTotalConsults(cloud.totalConsults ?? 0);
          AsyncStorage.setItem(KEY, JSON.stringify(cloud)).catch(() => {});
        }
      }).catch(() => {});
    });
  }, [token]);

  const recordConsult = useCallback(async () => {
    const raw = await AsyncStorage.getItem(KEY);
    let data: StreakData = raw
      ? JSON.parse(raw)
      : { streak: 0, lastConsultDate: '', totalConsults: 0 };

    const t = today();
    const prevStreak = data.streak;
    const prevTotal = data.totalConsults ?? 0;
    const prevRank = getRankTitle(prevTotal);

    // Don't double-count if already consulted today
    if (data.lastConsultDate === t) {
      return;
    }

    const newStreak = data.lastConsultDate === yesterday() ? prevStreak + 1 : 1;
    const newTotal = prevTotal + 1;
    const updatedData: StreakData = {
      streak: newStreak,
      lastConsultDate: t,
      totalConsults: newTotal,
    };

    await AsyncStorage.setItem(KEY, JSON.stringify(updatedData));
    cloudPut('/data/streak', token, updatedData);
    setStreak(newStreak);
    setTotalConsults(newTotal);

    // Check streak milestones
    if (MILESTONES.includes(newStreak) && newStreak !== prevStreak) {
      setNewMilestone(newStreak);
    }

    // Check rank promotion
    const updatedRank = getRankTitle(newTotal);
    if (updatedRank !== prevRank) {
      setNewRank(updatedRank);
    }
  }, [token]);

  const clearMilestone = useCallback(() => setNewMilestone(null), []);
  const clearRank = useCallback(() => setNewRank(null), []);
  const clear = useCallback(() => {
    const empty: StreakData = { streak: 0, lastConsultDate: '', totalConsults: 0 };
    AsyncStorage.removeItem(KEY);
    cloudPut('/data/streak', token, empty);
    setStreak(0);
    setTotalConsults(0);
    setNewMilestone(null);
    setNewRank(null);
  }, [token]);

  return {
    streak,
    streakLoaded,
    totalConsults,
    rankTitle: getRankTitle(totalConsults),
    newMilestone,
    newRank,
    recordConsult,
    clearMilestone,
    clearRank,
    clear,
  };
}
