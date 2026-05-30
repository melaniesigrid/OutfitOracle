import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const NOTIF_ENABLED_KEY    = '@outfit_oracle_notif_enabled';
export const NOTIF_HOUR_KEY       = '@outfit_oracle_notif_hour';
export const NOTIF_RATING_ID_KEY  = '@outfit_oracle_notif_rating_id';
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

async function scheduleDailyNotif(hour: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'The Oracle awaits.',
      body: 'Your daily verdict is ready. Open the Oracle.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
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

  async function enable(newHour = hour): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await scheduleDailyNotif(newHour);
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'true');
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
