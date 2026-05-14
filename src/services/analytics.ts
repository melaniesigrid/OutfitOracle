import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY  = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const ENDPOINT = 'https://us.i.posthog.com/capture/';
const ID_KEY   = '@outfit_oracle_device_id';

let deviceId: string | null = null;

async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  const stored = await AsyncStorage.getItem(ID_KEY);
  if (stored) { deviceId = stored; return deviceId; }
  // UUID v4
  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  await AsyncStorage.setItem(ID_KEY, id);
  deviceId = id;
  return deviceId;
}

function track(event: string, properties: Record<string, unknown> = {}): void {
  if (!API_KEY) return;
  getDeviceId().then(id => {
    fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key:     API_KEY,
        event,
        distinct_id: id,
        properties,
        timestamp:   new Date().toISOString(),
      }),
    }).catch(() => {});
  }).catch(() => {});
}

// ── Named events ───────────────────────────────────────────────────────────

export function trackAppOpened(fromCache: boolean) {
  track('app_opened', { from_cache: fromCache });
}

export function trackConsultStarted(city: string, gender: string) {
  track('consult_started', { city, gender });
}

export function trackConsultCompleted(
  city: string,
  gender: string,
  condition: string,
  temp: number,
  vibe: string,
  rating: number,
  durationMs: number
) {
  track('consult_completed', { city, gender, condition, temp, vibe, effort_rating: rating, duration_ms: durationMs });
}

export function trackConsultError(city: string, phase: 'weather' | 'verdict', message: string) {
  track('consult_error', { city, phase, error_message: message });
}

export function trackShareTapped(city: string, vibe: string) {
  track('share_card_tapped', { city, vibe });
}

export function trackRecentCityTapped(city: string) {
  track('recent_city_tapped', { city });
}

export function trackAutocompleteCitySelected(city: string) {
  track('autocomplete_city_selected', { city });
}

export function trackOnboardingCompleted() {
  track('onboarding_completed');
}
