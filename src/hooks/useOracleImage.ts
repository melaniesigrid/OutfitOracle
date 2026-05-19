import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OracleVerdict } from '../services/oracle';
import { WeatherData } from '../services/weather';
import { StyleProfile } from './useStyleProfile';
import { buildImagePrompt, buildSketchPrompt, generateOutfitImage, IMAGE_ENABLED, PHOTO_NEGATIVE_PROMPT, SKETCH_NEGATIVE_PROMPT } from '../services/imageGeneration';

export type ImageStatus = 'idle' | 'loading' | 'done' | 'error';

export interface OracleImageState {
  status: ImageStatus;
  url: string | null;
  error: string | null;
  regenerate: () => void;
  trigger: () => void;
}

export type OracleImageVariant = 'day' | 'night' | 'daySketch' | 'nightSketch';

function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function storageKey(
  city: string,
  vibe: string,
  gender: string,
  occasion: string | undefined,
  variant: OracleImageVariant = 'day',
  promptHash: string,
): string {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `@oracle_image_v2_${slug(city)}_${slug(gender)}_${slug(vibe)}_${slug(occasion ?? 'any')}_${variant}_${promptHash}`;
}

function imagePromptVariant(variant: OracleImageVariant): 'day' | 'night' {
  return variant === 'night' || variant === 'nightSketch' ? 'night' : 'day';
}

function isSketchVariant(variant: OracleImageVariant): boolean {
  return variant === 'daySketch' || variant === 'nightSketch';
}

export function useOracleImage(
  oracleStatus: string,
  verdict: OracleVerdict | null,
  weather: WeatherData | null,
  isFromCache: boolean,
  variant: OracleImageVariant = 'day',
  gender = 'Women',
  occasion?: string,
  profile?: StyleProfile,
  autoGenerate = true,
): OracleImageState {
  const [status, setStatus]     = useState<ImageStatus>('idle');
  const [url, setUrl]           = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const cancelledRef            = useRef(false);

  const generate = async (force = false, allowFromCachedVerdict = false) => {
    if (!IMAGE_ENABLED || !verdict || !weather) return;
    const photoVariant = imagePromptVariant(variant);
    if (photoVariant === 'night' && !verdict.outfitsAlt) return;

    const isSketch = isSketchVariant(variant);
    const prompt = isSketch
      ? buildSketchPrompt(verdict, weather, photoVariant, gender, occasion, profile)
      : buildImagePrompt(verdict, weather, photoVariant, gender, occasion, profile);
    const negativePrompt = isSketch ? SKETCH_NEGATIVE_PROMPT : PHOTO_NEGATIVE_PROMPT;
    const key = storageKey(weather.city, verdict.vibe, gender, occasion, variant, hashString(prompt));

    // User-triggered calls set loading synchronously before any async work so
    // OracleImage's showContainer stays true during look-mode/view switches.
    if (allowFromCachedVerdict) {
      setStatus('loading');
      setError(null);
      cancelledRef.current = false;
    }

    // Always check cache first, regardless of force flag
    // fal.ai CDN URLs expire ~24h; treat cached entries older than 6h as a miss
    const IMAGE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
    if (!force) {
      try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const { imageUrl, cachedAt } = JSON.parse(cached) as { imageUrl: string; cachedAt?: number };
          if (cachedAt && Date.now() - cachedAt < IMAGE_CACHE_TTL_MS) {
            setUrl(imageUrl);
            setStatus('done');
            return;
          }
        }
      } catch { /* ignore cache miss */ }
    }

    // Background auto-generation skips stale cached verdicts that have no image cache.
    // Explicit user actions (night/sketch/regenerate) can still create the missing asset.
    if (isFromCache && !force && !allowFromCachedVerdict) {
      setStatus('idle');
      return;
    }

    if (!allowFromCachedVerdict) {
      setStatus('loading');
      setError(null);
      cancelledRef.current = false;
    }

    try {
      const imageUrl = await generateOutfitImage(prompt, negativePrompt);

      if (cancelledRef.current) return;

      setUrl(imageUrl);
      setStatus('done');
      AsyncStorage.setItem(key, JSON.stringify({ imageUrl, cachedAt: Date.now() })).catch(() => {});
    } catch (e) {
      if (!cancelledRef.current) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      }
    }
  };

  // Reset on idle OR when a new consult starts (fetching-weather).
  // Without the fetching-weather case, a second city skips 'idle' entirely
  // and the stale URL/status from the previous city persists in hook state.
  useEffect(() => {
    if (oracleStatus === 'idle' || oracleStatus === 'fetching-weather') {
      cancelledRef.current = true;
      setStatus('idle');
      setUrl(null);
      setError(null);
    }
  }, [oracleStatus]);

  // Auto-trigger when verdict lands — skipped for on-demand variants (sketch)
  useEffect(() => {
    if (!autoGenerate) return;
    if (oracleStatus !== 'done' || !verdict || !weather) return;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oracleStatus, verdict?.vibe, weather?.city, occasion, variant]);

  return {
    status,
    url,
    error,
    regenerate: () => generate(true, true),
    trigger:    () => generate(false, true),
  };
}
