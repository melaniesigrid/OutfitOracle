import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { fetchWeather, fetchWeatherByCoords, WeatherData } from '../services/weather';
import { fetchOracleVerdict, OracleVerdict } from '../services/oracle';
import { StyleProfile } from './useStyleProfile';
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
  const [isOffline, setIsOffline]       = useState(false);
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

  const runConsult = useCallback(async (
    city: string,
    gender: string,
    wxFetch: Promise<WeatherData>,
    styleProfile?: StyleProfile,
    occasion?: string,
  ) => {
    isFromCacheRef.current = false;
    setError(null);
    setVerdict(null);
    setWeather(null);
    setCachedCity(null);
    setCachedAt(null);
    setIsOffline(false);

    const startedAt = Date.now();
    trackConsultStarted(city, gender);

    try {
      setStatus('fetching-weather');
      const wx = await wxFetch;
      setWeather(wx);

      setStatus('fetching-verdict');
      const v = await fetchOracleVerdict(wx, gender, apiKey, styleProfile, occasion);
      setVerdict(v);
      setStatus('done');

      trackConsultCompleted(city, gender, wx.conditionLabel, wx.temp, v.vibe, v.rating, Date.now() - startedAt);

      const toCache: CachedResult = { city, weather: wx, verdict: v, timestamp: Date.now() };
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
    } catch (e: unknown) {
      const phase = weather ? 'verdict' : 'weather';
      const msg = e instanceof Error ? e.message : 'Something went wrong. The Oracle is displeased.';
      const isNetworkError = /signal|Network request failed/i.test(msg);

      if (isNetworkError) {
        // Network failure — try to restore the last cached result before surfacing an error
        try {
          const raw = await AsyncStorage.getItem(CACHE_KEY);
          if (raw) {
            const parsed: CachedResult = JSON.parse(raw);
            isFromCacheRef.current = true;
            setWeather(parsed.weather);
            setVerdict(parsed.verdict);
            setCachedCity(parsed.city);
            setCachedAt(parsed.timestamp);
            setIsOffline(true);
            setStatus('done');
            return;
          }
        } catch {}
        // No cache available — show the offline-specific message
        setError('The Oracle requires a connection. Return when the signal is clear.');
      } else {
        Sentry.captureException(e, { tags: { city, phase } });
        setError(msg);
      }
      trackConsultError(city, phase, msg);
      setStatus('error');
    }
  }, [apiKey]);

  const consult = useCallback(
    (city: string, gender: string, styleProfile?: StyleProfile, occasion?: string) =>
      runConsult(city, gender, fetchWeather(city), styleProfile, occasion),
    [runConsult],
  );

  const consultByCoords = useCallback(
    (lat: number, lng: number, city: string, country: string, gender: string, styleProfile?: StyleProfile, occasion?: string) =>
      runConsult(city, gender, fetchWeatherByCoords(lat, lng, city, country), styleProfile, occasion),
    [runConsult],
  );

  const reset = useCallback(() => {
    isFromCacheRef.current = false;
    setStatus('idle');
    setWeather(null);
    setVerdict(null);
    setError(null);
    setCachedCity(null);
    setCachedAt(null);
    setIsOffline(false);
  }, []);

  return {
    status,
    weather,
    verdict,
    error,
    consult,
    consultByCoords,
    reset,
    cachedCity,
    cachedAt,
    isFromCache: isFromCacheRef.current,
    isOffline,
  };
}
