import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from './weather';
import { resolveShopQueries } from './shoppingLinks';
import { StyleProfile } from '../hooks/useStyleProfile';

const DEVICE_ID_KEY = '@outfit_oracle_device_id';

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL ?? '';

export interface OutfitItem {
  category: string;
  item: string;
  shopItems?: string[];
  detail: string;
  accentColor: 'mint' | 'lavender' | 'coral' | 'lemon' | 'iris';
}

export interface OracleVerdict {
  verdict: string;
  vibe: string;
  outfits: OutfitItem[];
  outfitsAlt?: OutfitItem[];
  avoid: string[];
  rating: number;
  foundingMember?: boolean;
}

export function normalizeVerdictShopItems(verdict: OracleVerdict): OracleVerdict {
  const withShopItems = (items: OutfitItem[] | undefined) =>
    items?.map(item => ({
      ...item,
      shopItems: resolveShopQueries(item),
    }));

  return {
    ...verdict,
    outfits: withShopItems(verdict.outfits) ?? [],
    outfitsAlt: verdict.outfitsAlt ? withShopItems(verdict.outfitsAlt) : undefined,
  };
}


const DEFAULT_LAT = 45; // Northern Hemisphere fallback when no GPS fix is available

// Keep in sync with getSeason() in cloudflare-worker/index.js — both copies must match.
export function getSeason(month: number, lat?: number): string {
  const isNorthern = (lat ?? DEFAULT_LAT) >= 0;
  const m = isNorthern ? month : (month + 6) % 12;
  if (m >= 2 && m <= 4) return 'Spring';
  if (m >= 5 && m <= 7) return 'Summer';
  if (m >= 8 && m <= 10) return 'Autumn';
  return 'Winter';
}

const PROXY_TIMEOUT_MS = 40_000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function viaProxy(weather: WeatherData, gender: string, profile?: StyleProfile, occasion?: string, attempt = 0): Promise<OracleVerdict> {
  const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY).catch(() => null);

  const { pollen: _p, hourly: _h, daily: _d, sunrise: _sr, sunset: _ss, moonPhase: _mp, moonPhaseName: _mpn, moonPhaseIcon: _mpi, ...weatherCore } = weather;
  const payload = { weather: weatherCore, gender, styleProfile: profile, occasion };

  let resp: Response;
  try {
    resp = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(deviceId ? { 'X-Device-ID': deviceId } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const isTimeout = e instanceof Error && e.name === 'AbortError';
    if (isTimeout) throw new Error('The Oracle timed out. Check your connection and try again.');
    throw new Error('The Oracle requires a signal. Check your connection and try again.');
  }

  if (!resp.ok) {
    if (resp.status === 429) {
      const retrySeconds = Number(resp.headers.get('Retry-After') ?? 86400);
      const hours = Math.ceil(retrySeconds / 3600);
      throw new Error(`The Oracle has spoken enough today. Available again in ${hours === 1 ? '1 hour' : `${hours} hours`}.`);
    }
    // 504 = Anthropic API gateway timeout — don't retry, fail immediately
    if (resp.status === 504) {
      throw new Error('The Oracle is unreachable right now. Anthropic may be experiencing issues — try again in a few minutes.');
    }
    // 529 = Cloudflare/Anthropic overloaded, 503/502 = transient upstream failure — auto-retry
    if ((resp.status === 529 || resp.status === 503 || resp.status === 502) && attempt < 2) {
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
      return viaProxy(weather, gender, profile, occasion, attempt + 1);
    }
    if (resp.status === 529 || resp.status === 503 || resp.status === 502) {
      // Surface Anthropic's actual message (e.g. "credit limit reached") if present
      const body = await resp.json().catch(() => ({})) as { error?: string };
      const detail = typeof body.error === 'string' ? ` ${body.error}` : '';
      throw new Error(`The Oracle is momentarily overwhelmed.${detail} Please try again in a moment.`);
    }
    if (resp.status >= 500) {
      throw new Error('The Oracle is momentarily unavailable. The fashion world waits.');
    }
    throw new Error('The Oracle is displeased. Something went wrong.');
  }

  const verdict = await resp.json().catch(() => {
    throw new Error('The Oracle is displeased. The response was unreadable.');
  }) as OracleVerdict;
  const normalizedVerdict = normalizeVerdictShopItems(verdict);
  return normalizedVerdict;
}

export async function fetchOracleVerdict(
  weather: WeatherData,
  gender: string,
  profile?: StyleProfile,
  occasion?: string,
): Promise<OracleVerdict> {
  return viaProxy(weather, gender, profile, occasion);
}
