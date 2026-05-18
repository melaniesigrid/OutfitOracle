import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OracleVerdict } from '../services/oracle';
import { WeatherData } from '../services/weather';

const KEY = '@outfit_oracle_look_archive_v1';
const MAX_ENTRIES = 100;

export type Reaction = 'liked' | 'disliked' | null;

export interface ArchivedWeather {
  temp: number;
  feelsLike: number;
  conditionLabel: string;
  conditionIcon: string;
  city: string;
  country: string;
}

export interface ArchivedVerdict {
  verdict: string;
  vibe: string;
  rating: number;
  outfits: OracleVerdict['outfits'];
  outfitsAlt?: OracleVerdict['outfitsAlt'];
  avoid: string[];
}

export interface ArchiveImages {
  day?: string;
  night?: string;
  daySketch?: string;
  nightSketch?: string;
  /** Legacy key from archive entries created before day/night sketch split. */
  sketch?: string;
}

export interface ArchiveEntry {
  id: string;
  savedAt: number;
  city: string;
  gender: string;
  occasion?: string;
  note?: string;
  weather: ArchivedWeather;
  verdict: ArchivedVerdict;
  images: ArchiveImages;
  reaction: Reaction;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function snapshotWeather(w: WeatherData): ArchivedWeather {
  return {
    temp: w.temp, feelsLike: w.feelsLike,
    conditionLabel: w.conditionLabel, conditionIcon: w.conditionIcon,
    city: w.city, country: w.country,
  };
}

function snapshotVerdict(v: OracleVerdict): ArchivedVerdict {
  return {
    verdict: v.verdict, vibe: v.vibe, rating: v.rating,
    outfits: v.outfits, outfitsAlt: v.outfitsAlt, avoid: v.avoid,
  };
}

function normalizeImages(images: ArchiveImages): ArchiveImages {
  return {
    ...images,
    daySketch: images.daySketch ?? images.sketch,
  };
}

function mergeImages(current: ArchiveImages, incoming: ArchiveImages): ArchiveImages {
  return normalizeImages({ ...current, ...incoming });
}

function sameImages(a: ArchiveImages, b: ArchiveImages): boolean {
  return (
    a.day === b.day &&
    a.night === b.night &&
    a.daySketch === b.daySketch &&
    a.nightSketch === b.nightSketch &&
    a.sketch === b.sketch
  );
}

export function useArchive() {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setEntries(JSON.parse(raw)); } catch { /* stale */ }
      }
    }).finally(() => setLoaded(true));
  }, []);

  const persist = useCallback((next: ArchiveEntry[]) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addEntry = useCallback((
    city: string,
    gender: string,
    weather: WeatherData,
    verdict: OracleVerdict,
    images: ArchiveImages,
    occasion?: string,
    reaction: Reaction = null,
  ): string => {
    let returnedId = '';
    setEntries(prev => {
      // Update existing entry for same vibe+city today instead of duplicating
      const today = new Date().toDateString();
      const existing = prev.find(
        e => e.verdict.vibe === verdict.vibe &&
             e.city.toLowerCase() === city.toLowerCase() &&
             new Date(e.savedAt).toDateString() === today,
      );
      if (existing) {
        returnedId = existing.id;
        const next = prev.map(e =>
          e.id === existing.id
            ? { ...e, images: mergeImages(e.images, images), reaction: reaction ?? e.reaction }
            : e,
        );
        persist(next);
        return next;
      }
      const id = makeId();
      returnedId = id;
      const entry: ArchiveEntry = {
        id, savedAt: Date.now(), city, gender, occasion,
        weather: snapshotWeather(weather),
        verdict: snapshotVerdict(verdict),
        images: normalizeImages(images), reaction,
      };
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      persist(next);
      return next;
    });
    return returnedId;
  }, [persist]);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const setReaction = useCallback((id: string, reaction: Reaction) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, reaction } : e);
      persist(next);
      return next;
    });
  }, [persist]);

  const updateImages = useCallback((id: string, images: ArchiveImages) => {
    setEntries(prev => {
      let changed = false;
      const next = prev.map(e => {
        if (e.id !== id) return e;
        const merged = mergeImages(e.images, images);
        if (sameImages(e.images, merged)) return e;
        changed = true;
        return { ...e, images: merged };
      });
      if (changed) persist(next);
      return changed ? next : prev;
    });
  }, [persist]);

  const setNote = useCallback((id: string, note: string) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, note: note.trim() || undefined } : e);
      persist(next);
      return next;
    });
  }, [persist]);

  const findEntry = useCallback((vibe: string, city: string): ArchiveEntry | null => {
    const today = new Date().toDateString();
    return entries.find(
      e => e.verdict.vibe === vibe &&
           e.city.toLowerCase() === city.toLowerCase() &&
           new Date(e.savedAt).toDateString() === today,
    ) ?? null;
  }, [entries]);

  return { entries, loaded, addEntry, removeEntry, setReaction, setNote, updateImages, findEntry };
}
