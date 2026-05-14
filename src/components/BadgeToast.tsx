import React, { useEffect, useRef } from 'react';
import {
  View, Text, Pressable, Animated, Easing, StyleSheet, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WeatherBadge } from '../hooks/useWeatherBadges';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme';

const DISPLAY_MS  = 3500;
const ANIMATE_MS  = 320;
const BOTTOM_SAFE = Platform.OS === 'ios' ? 100 : 72;

interface Props {
  badge: WeatherBadge | undefined;
  onDismiss: () => void;
}

export function BadgeToast({ badge, onDismiss }: Props) {
  const { colors, fonts, themeName } = useTheme();
  const accentColor = themeName === 'classic' ? colors.scarlet : colors.borderHard;
  const translateY      = useRef(new Animated.Value(200)).current;
  const opacity         = useRef(new Animated.Value(0)).current;
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDismissingRef = useRef(false);

  useEffect(() => {
    if (!badge) return;

    isDismissingRef.current = false;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: ANIMATE_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: ANIMATE_MS, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(dismiss, DISPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // badge.id dependency ensures a new badge re-triggers the animation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badge?.id]);

  function dismiss() {
    if (isDismissingRef.current) return;
    isDismissingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 200, duration: ANIMATE_MS, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: ANIMATE_MS, useNativeDriver: true }),
    ]).start(() => onDismiss());
  }

  if (!badge) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: BOTTOM_SAFE, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        style={[styles.card, { backgroundColor: colors.bgDark, borderColor: 'rgba(250,249,246,0.12)' }]}
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel={`Achievement unlocked: ${badge.title}. Tap to dismiss.`}
      >
        <View style={[styles.accent, { backgroundColor: accentColor }]} />
        <MaterialCommunityIcons
          name={badge.icon as any}
          size={26}
          color="#FAF9F6"
          style={styles.icon}
        />
        <View style={styles.body}>
          <Text style={[styles.eyebrow, { fontFamily: fonts.mono }]}>ACHIEVEMENT UNLOCKED</Text>
          <Text style={[styles.title, { fontFamily: fonts.display }]} numberOfLines={1}>
            {badge.title}
          </Text>
          <Text style={[styles.desc, { fontFamily: fonts.mono }]} numberOfLines={2}>
            {badge.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left:  spacing.md,
    right: spacing.md,
    zIndex: 999,
    elevation: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
  },
  icon: {
    marginHorizontal: spacing.md,
  },
  body: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: spacing.md,
    gap: 3,
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    color: 'rgba(250,249,246,0.40)',
  },
  title: {
    fontSize: 20,
    color: '#FAF9F6',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  desc: {
    fontSize: 10,
    color: 'rgba(250,249,246,0.50)',
    letterSpacing: 0.2,
    lineHeight: 14,
  },
});
