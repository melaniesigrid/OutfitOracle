import { useMemo, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArchiveEntry, ArchiveImages } from './useArchive';
import { HistoryEntry } from './useOutfitHistory';
import { isStylePassportLandmark } from '../data/fashionCapitals';

const DESCRIPTOR_KEY_PREFIX = '@outfit_oracle_city_descriptor_';

export interface CityPassportData {
  isNewCity: boolean;
  visitCount: number;               // from history (capped at 20 total, approximation)
  daysSinceLastVisit: number | null;
  lastVibe: string | null;
  archiveImages: ArchiveImages[];   // up to 4, from explicitly saved looks
  isFashionCapital: boolean;
  descriptor: string | null;        // Claude-generated, cached in AsyncStorage
}

function cityKey(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, '_');
}

export function useCityPassport(
  city: string | null,
  history: HistoryEntry[],
  historyLoaded: boolean,
  archiveEntries: ArchiveEntry[],
  archiveLoaded: boolean,
): CityPassportData | null {
  const [descriptor, setDescriptor] = useState<string | null>(null);

  const key = city ? cityKey(city) : null;

  useEffect(() => {
    if (!key) { setDescriptor(null); return; }
    AsyncStorage.getItem(DESCRIPTOR_KEY_PREFIX + key)
      .then(val => { if (val) setDescriptor(val); else setDescriptor(null); })
      .catch(() => setDescriptor(null));
  }, [key]);

  return useMemo(() => {
    if (!city || !historyLoaded || !archiveLoaded) return null;
    const lower = city.trim().toLowerCase();

    const cityHistory = history.filter(e => e.city.trim().toLowerCase() === lower);
    const visitCount = cityHistory.length;
    const isNewCity = visitCount === 0;

    let daysSinceLastVisit: number | null = null;
    let lastVibe: string | null = null;
    if (!isNewCity) {
      const latest = cityHistory.reduce((a, b) => a.consultedAt > b.consultedAt ? a : b);
      daysSinceLastVisit = Math.floor((Date.now() - latest.consultedAt) / 86_400_000);
      lastVibe = latest.verdict.vibe;
    }

    const archiveImages = archiveEntries
      .filter(e => e.city.trim().toLowerCase() === lower)
      .filter(e => e.images.day || e.images.night || e.images.daySketch || e.images.nightSketch || e.images.sketch)
      .map(e => e.images)
      .slice(0, 4);

    return {
      isNewCity,
      visitCount,
      daysSinceLastVisit,
      lastVibe,
      archiveImages,
      isFashionCapital: isStylePassportLandmark(city),
      descriptor,
    };
  }, [city, history, historyLoaded, archiveEntries, archiveLoaded, descriptor]);
}

export function saveCityDescriptor(city: string, desc: string): void {
  AsyncStorage.setItem(DESCRIPTOR_KEY_PREFIX + cityKey(city), desc).catch(() => {});
}
