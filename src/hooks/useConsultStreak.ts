import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@outfit_oracle_streak';

const MILESTONES = [3, 7, 14, 30, 100];

const RANK_TITLES: Array<{ min: number; title: string }> = [
  { min: 100, title: "Oracle's Chosen" },
  { min: 50,  title: 'Muse' },
  { min: 20,  title: 'Connoisseur' },
  { min: 5,   title: 'Devotee' },
  { min: 1,   title: 'Initiate' },
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
  return RANK_TITLES.find(r => totalConsults >= r.min)?.title ?? 'Initiate';
}

export function useConsultStreak() {
  const [streak, setStreak] = useState(0);
  const [totalConsults, setTotalConsults] = useState(0);
  const [newMilestone, setNewMilestone] = useState<number | null>(null);
  const [newRank, setNewRank] = useState<string | null>(null);

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
    });
  }, []);

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
  }, []);

  const clearMilestone = useCallback(() => setNewMilestone(null), []);
  const clearRank = useCallback(() => setNewRank(null), []);

  return {
    streak,
    totalConsults,
    rankTitle: getRankTitle(totalConsults),
    newMilestone,
    newRank,
    recordConsult,
    clearMilestone,
    clearRank,
  };
}
