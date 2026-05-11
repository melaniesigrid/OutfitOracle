import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeather, WeatherData } from '../services/weather';
import { fetchOracleVerdict, OracleVerdict } from '../services/oracle';
import {
  trackConsultStarted,
  trackConsultCompleted,
  trackConsultError,
} from '../services/analytics';

const CACHE_KEY = '@outfit_oracle_last_result';
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

interface CachedResult {
  city: string;
  weather: WeatherData;
  verdict: OracleVerdict;
  timestamp: number;
}

export type OracleStatus = 'idle' | 'fetching-weather' | 'fetching-verdict' | 'done' | 'error';

export function useOracle(apiKey: string) {
  const [status, setStatus]   = useState<OracleStatus>('idle');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [verdict, setVerdict] = useState<OracleVerdict | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [cachedCity, setCachedCity]     = useState<string | null>(null);
  const [cachedAt, setCachedAt]         = useState<number | null>(null);
  const isFromCacheRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY).then(raw => {
      if (!raw) return;
      try {
        const parsed: CachedResult = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          isFromCacheRef.current = true;
          setWeather(parsed.weather);
          setVerdict(parsed.verdict);
          setCachedCity(parsed.city);
          setCachedAt(parsed.timestamp);
          setStatus('done');
        }
      } catch {
        AsyncStorage.removeItem(CACHE_KEY);
      }
    });
  }, []);

  const consult = useCallback(async (city: string, gender: string) => {
    isFromCacheRef.current = false;
    setError(null);
    setVerdict(null);
    setWeather(null);
    setCachedCity(null);
    setCachedAt(null);

    const startedAt = Date.now();
    trackConsultStarted(city, gender);

    try {
      setStatus('fetching-weather');
      const wx = await fetchWeather(city);
      setWeather(wx);

      setStatus('fetching-verdict');
      const v = await fetchOracleVerdict(wx, gender, apiKey);
      setVerdict(v);
      setStatus('done');

      trackConsultCompleted(city, gender, wx.conditionLabel, wx.temp, v.vibe, v.rating, Date.now() - startedAt);

      const toCache: CachedResult = { city, weather: wx, verdict: v, timestamp: Date.now() };
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. The Oracle is displeased.';
      const phase = weather ? 'verdict' : 'weather';
      trackConsultError(city, phase, msg);
      setError(msg);
      setStatus('error');
    }
  }, [apiKey]);

  const reset = useCallback(() => {
    isFromCacheRef.current = false;
    setStatus('idle');
    setWeather(null);
    setVerdict(null);
    setError(null);
    setCachedCity(null);
    setCachedAt(null);
  }, []);

  return {
    status,
    weather,
    verdict,
    error,
    consult,
    reset,
    cachedCity,
    cachedAt,
    isFromCache: isFromCacheRef.current,
  };
}
