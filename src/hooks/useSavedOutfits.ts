import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OutfitItem } from '../services/oracle';

const KEY = '@outfit_oracle_saved';

// TO DO — Product image search:
// Saved items could show actual product photos by querying image APIs
// with the item name. Feasible options: Google Shopping API (paid),
// SerpApi Google Shopping, Bing Image Search, or open-source scrapers.
// The "SHOP THIS PIECE" Google link already exists — image preview
// would be the next step for a richer item archive experience.

export type ItemReaction = 'liked' | 'disliked' | null;

export interface SavedOutfitWeather {
  temp: number;
  conditionLabel: string;
}

export interface SavedOutfit {
  item: OutfitItem;
  city: string;
  vibe: string;
  savedAt: number;
  weather?: SavedOutfitWeather;
  reaction?: ItemReaction;
}

export function useSavedOutfits() {
  const [saved, setSaved] = useState<SavedOutfit[]>([]);
  const [savedLoaded, setSavedLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setSaved(JSON.parse(raw)); } catch { /* stale data */ }
      }
    }).finally(() => setSavedLoaded(true));
  }, []);

  const saveOutfit = useCallback((
    item: OutfitItem,
    city: string,
    vibe: string,
    weather?: SavedOutfitWeather,
  ) => {
    setSaved(prev => {
      if (prev.some(s => s.item.item === item.item && s.city === city)) return prev;
      const next = [{ item, city, vibe, savedAt: Date.now(), weather }, ...prev].slice(0, 50);
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

  const setReaction = useCallback((item: OutfitItem, city: string, reaction: ItemReaction) => {
    setSaved(prev => {
      const next = prev.map(s =>
        s.item.item === item.item && s.city === city ? { ...s, reaction } : s,
      );
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

  return { saved, savedLoaded, saveOutfit, removeOutfit, setReaction, isSaved, clear };
}
