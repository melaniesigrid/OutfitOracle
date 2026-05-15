import { useRef, useState, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAGIC_KEY = '@outfit_oracle_magic_shown';

export function useMagicMoment() {
  const magicOpacity = useRef(new Animated.Value(0)).current;
  const [showMagicMoment, setShowMagicMoment] = useState(false);

  const dismissMagicMoment = useCallback(() => {
    Animated.timing(magicOpacity, {
      toValue: 0, duration: 500,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setShowMagicMoment(false));
  }, [magicOpacity]);

  const triggerMagicMoment = useCallback(() => {
    magicOpacity.setValue(0);
    setShowMagicMoment(true);
    Animated.timing(magicOpacity, {
      toValue: 1, duration: 700,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => { setTimeout(dismissMagicMoment, 2800); });
  }, [magicOpacity, dismissMagicMoment]);

  // Call this when status === 'done' && !isFromCache, before addEntry.
  // Fires the overlay exactly once (guarded by AsyncStorage key).
  const tryTriggerFirstConsult = useCallback((historyLength: number) => {
    if (historyLength !== 0) return;
    AsyncStorage.getItem(MAGIC_KEY)
      .then(val => {
        if (!val) {
          AsyncStorage.setItem(MAGIC_KEY, '1').catch(() => {});
          triggerMagicMoment();
        }
      })
      .catch(() => {});
  }, [triggerMagicMoment]);

  return { magicOpacity, showMagicMoment, dismissMagicMoment, tryTriggerFirstConsult };
}
