import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from '../services/weather';
import { OracleVerdict } from '../services/oracle';
import { useAuth } from '../contexts/AuthContext';
import { cloudGet, cloudPut } from '../services/cloudData';

const KEY = '@outfit_oracle_history';
const FIRST_CONSULT_KEY = '@outfit_oracle_first_consult';
const MAX_ENTRIES = 20;
const DEDUP_WINDOW_MS = 5 * 60 * 1000;

export interface HistoryEntry {
  id: string;
  city: string;
  gender: string;
  occasion?: string;
  weather: WeatherData;
  verdict: OracleVerdict;
  consultedAt: number;
  userRating?: 1 | 2 | 3 | 4 | 5;
}

export function useOutfitHistory() {
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [firstConsultAt, setFirstConsultAt] = useState<number | undefined>();
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load local first, then fetch from cloud and prefer cloud if it has data
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEY).then(raw => {
        if (!raw) return;
        try { setHistory(JSON.parse(raw)); }
        catch { AsyncStorage.removeItem(KEY); }
      }),
      AsyncStorage.getItem(FIRST_CONSULT_KEY).then(raw => {
        if (raw) setFirstConsultAt(Number(raw));
      }),
    ]).finally(() => setHistoryLoaded(true));
  }, []);

  useEffect(() => {
    if (!token) return;
    cloudGet<HistoryEntry[]>('/data/history', token).then(cloud => {
      if (cloud && cloud.length > 0) {
        setHistory(cloud);
        AsyncStorage.setItem(KEY, JSON.stringify(cloud)).catch(() => {});
      }
    });
  }, [token]);

  const addEntry = useCallback((
    city: string,
    gender: string,
    weather: WeatherData,
    verdict: OracleVerdict,
    occasion?: string,
  ) => {
    const now = Date.now();
    setHistory(prev => {
      const deduped = prev.filter(
        e => e.city !== city || (now - e.consultedAt) > DEDUP_WINDOW_MS,
      );
      const next = [
        { id: String(now), city, gender, occasion, weather, verdict, consultedAt: now },
        ...deduped,
      ].slice(0, MAX_ENTRIES);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      cloudPut('/data/history', token, next);
      return next;
    });
    AsyncStorage.getItem(FIRST_CONSULT_KEY).then(existing => {
      if (!existing) {
        AsyncStorage.setItem(FIRST_CONSULT_KEY, String(now));
        setFirstConsultAt(now);
      }
    });
  }, [token]);

  const setUserRating = useCallback((id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    setHistory(prev => {
      const next = prev.map(e => e.id === id ? { ...e, userRating: rating } : e);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      cloudPut('/data/history', token, next);
      return next;
    });
  }, [token]);

  const clear = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(KEY);
    cloudPut('/data/history', token, []);
  }, [token]);

  return { history, addEntry, setUserRating, clear, firstConsultAt, historyLoaded };
}
