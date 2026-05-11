import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from '../services/weather';
import { OracleVerdict } from '../services/oracle';

const KEY = '@outfit_oracle_history';
const FIRST_CONSULT_KEY = '@outfit_oracle_first_consult';
const MAX_ENTRIES = 20;
const DEDUP_WINDOW_MS = 5 * 60 * 1000;

export interface HistoryEntry {
  id: string;
  city: string;
  gender: string;
  weather: WeatherData;
  verdict: OracleVerdict;
  consultedAt: number;
}

export function useOutfitHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [firstConsultAt, setFirstConsultAt] = useState<number | undefined>();

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) return;
      try { setHistory(JSON.parse(raw)); }
      catch { AsyncStorage.removeItem(KEY); }
    });
    AsyncStorage.getItem(FIRST_CONSULT_KEY).then(raw => {
      if (raw) setFirstConsultAt(Number(raw));
    });
  }, []);

  const addEntry = useCallback((
    city: string,
    gender: string,
    weather: WeatherData,
    verdict: OracleVerdict,
  ) => {
    const now = Date.now();
    setHistory(prev => {
      const deduped = prev.filter(
        e => e.city !== city || (now - e.consultedAt) > DEDUP_WINDOW_MS,
      );
      const next = [
        { id: String(now), city, gender, weather, verdict, consultedAt: now },
        ...deduped,
      ].slice(0, MAX_ENTRIES);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
    AsyncStorage.getItem(FIRST_CONSULT_KEY).then(existing => {
      if (!existing) {
        AsyncStorage.setItem(FIRST_CONSULT_KEY, String(now));
        setFirstConsultAt(now);
      }
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(KEY);
  }, []);

  return { history, addEntry, clear, firstConsultAt };
}
