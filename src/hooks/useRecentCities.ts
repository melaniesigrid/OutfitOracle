import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@outfit_oracle_recent_cities';
const MAX = 5;

export function useRecentCities() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) setRecents(JSON.parse(raw));
    });
  }, []);

  const addCity = useCallback(async (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recents.filter(c => c.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX);
    setRecents(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  }, [recents]);

  const removeCity = useCallback(async (city: string) => {
    const updated = recents.filter(c => c !== city);
    setRecents(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  }, [recents]);

  return { recents, addCity, removeCity };
}
