import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const NOTIF_ENABLED_KEY    = '@outfit_oracle_notif_enabled';
export const NOTIF_HOUR_KEY       = '@outfit_oracle_notif_hour';
export const NOTIF_RATING_ID_KEY  = '@outfit_oracle_notif_rating_id';
export const NOTIF_LAST_CITY_KEY  = '@outfit_oracle_notif_last_city';
export const NOTIF_PROMPTED_KEY   = '@outfit_oracle_notif_prompted';
export const DEFAULT_NOTIF_HOUR   = 8;

async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
  }
}

function buildNotifBody(city: string | null, tempLabel: string | null): string {
  if (city && tempLabel) return `${city}, ${tempLabel} — the Oracle has a verdict for you.`;
  if (city) return `${city} — the Oracle has a verdict for you.`;
  return 'Your daily verdict is ready. Open the Oracle.';
}

async function scheduleDailyNotif(hour: number, city?: string | null, tempLabel?: string | null): Promise<void> {
  const storedCity = city ?? await AsyncStorage.getItem(NOTIF_LAST_CITY_KEY).catch(() => null);
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'The Oracle awaits.',
      body: buildNotifBody(storedCity, tempLabel ?? null),
      sound: true,
      data: { screen: 'Oracle', city: storedCity },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

/** Call after every successful consult to keep the notification body current. */
export async function saveLastConsultLocation(city: string, tempLabel: string): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_LAST_CITY_KEY, city);
    const [enabled, hourRaw] = await Promise.all([
      AsyncStorage.getItem(NOTIF_ENABLED_KEY),
      AsyncStorage.getItem(NOTIF_HOUR_KEY),
    ]);
    if (enabled === 'true') {
      const hour = hourRaw !== null ? Number(hourRaw) : DEFAULT_NOTIF_HOUR;
      await scheduleDailyNotif(hour, city, tempLabel);
    }
  } catch {
    // Non-critical
  }
}

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour]       = useState(DEFAULT_NOTIF_HOUR);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    setupAndroidChannel().catch(() => {});
    Promise.all([
      AsyncStorage.getItem(NOTIF_ENABLED_KEY),
      AsyncStorage.getItem(NOTIF_HOUR_KEY),
    ]).then(([en, hr]) => {
      setEnabled(en === 'true');
      if (hr !== null) setHour(Number(hr));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  async function enable(newHour = hour, city?: string | null, tempLabel?: string | null): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await scheduleDailyNotif(newHour, city, tempLabel);
    await Promise.all([
      AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'true'),
      AsyncStorage.setItem(NOTIF_PROMPTED_KEY, 'true'),
    ]);
    setEnabled(true);
    return true;
  }

  async function disable(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'false');
    setEnabled(false);
  }

  async function updateHour(newHour: number): Promise<void> {
    setHour(newHour);
    await AsyncStorage.setItem(NOTIF_HOUR_KEY, String(newHour));
    if (enabled) await scheduleDailyNotif(newHour);
  }

  return { enabled, hour, loaded, enable, disable, updateHour };
}

export async function scheduleRatingReminder(city: string, vibe: string): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel any existing rating reminder before scheduling a new one
    const prevId = await AsyncStorage.getItem(NOTIF_RATING_ID_KEY);
    if (prevId) {
      await Notifications.cancelScheduledNotificationAsync(prevId).catch(() => {});
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Did the Oracle get it right?',
        body: `You asked for ${city} — "${vibe}". Rate today's verdict.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 8 * 3600,
        repeats: false,
      },
    });

    await AsyncStorage.setItem(NOTIF_RATING_ID_KEY, id);
  } catch {
    // Non-critical — rating reminder is best-effort
  }
}
