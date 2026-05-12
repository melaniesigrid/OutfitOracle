import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OutfitItem } from '../services/oracle';

const KEY = '@outfit_oracle_saved';

export interface SavedOutfit {
  item: OutfitItem;
  city: string;
  vibe: string;
  savedAt: number;
}

export function useSavedOutfits() {
  const [saved, setSaved] = useState<SavedOutfit[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setSaved(JSON.parse(raw)); } catch { /* stale data */ }
      }
    });
  }, []);

  const saveOutfit = useCallback((item: OutfitItem, city: string, vibe: string) => {
    setSaved(prev => {
      if (prev.some(s => s.item.item === item.item && s.city === city)) return prev;
      const next = [{ item, city, vibe, savedAt: Date.now() }, ...prev].slice(0, 50);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeOutfit = useCallback((item: OutfitItem, city: string) => {
    setSaved(prev => {
      const next = prev.filter(s => !(s.item.item === item.item && s.city === city));
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isSaved = useCallback((item: OutfitItem, city: string) => {
    return saved.some(s => s.item.item === item.item && s.city === city);
  }, [saved]);

  const clear = useCallback(() => {
    AsyncStorage.removeItem(KEY);
    setSaved([]);
  }, []);

  return { saved, saveOutfit, removeOutfit, isSaved, clear };
}
