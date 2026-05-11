import { useState, useCallback } from 'react';
import { fetchWeather, WeatherData } from '../services/weather';
import { fetchOracleVerdict, OracleVerdict } from '../services/oracle';

export type OracleStatus = 'idle' | 'fetching-weather' | 'fetching-verdict' | 'done' | 'error';

export function useOracle(apiKey: string) {
  const [status, setStatus]   = useState<OracleStatus>('idle');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [verdict, setVerdict] = useState<OracleVerdict | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const consult = useCallback(async (city: string, gender: string) => {
    setError(null);
    setVerdict(null);
    setWeather(null);

    try {
      setStatus('fetching-weather');
      const wx = await fetchWeather(city);
      setWeather(wx);

      setStatus('fetching-verdict');
      const v = await fetchOracleVerdict(wx, gender, apiKey);
      setVerdict(v);
      setStatus('done');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. The Oracle is displeased.');
      setStatus('error');
    }
  }, [apiKey]);

  const reset = useCallback(() => {
    setStatus('idle');
    setWeather(null);
    setVerdict(null);
    setError(null);
  }, []);

  return { status, weather, verdict, error, consult, reset };
}
