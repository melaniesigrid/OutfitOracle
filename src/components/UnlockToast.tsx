import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible: boolean;
  type: 'milestone' | 'rank';
  value: number | string | null;
  topInset?: number;
  onDismiss: () => void;
}

export function UnlockToast({ visible, type, value, topInset = 0, onDismiss }: Props) {
  const { colors, fonts } = useTheme();
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible || value === null) {
      translateY.setValue(-140);
      opacity.setValue(0);
      return;
    }

    translateY.setValue(-140);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -140,
          duration: 320,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 3400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, value]);

  if (!visible || value === null) return null;

  const label = type === 'rank' ? 'RANK ACHIEVED' : 'STYLE STREAK';
  const body  = type === 'rank'
    ? `You are now ${value}.`
    : `${value}-day streak. The Oracle takes note.`;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          top: topInset + spacing.sm,
          backgroundColor: colors.bgDark,
          borderColor: colors.scarlet,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={[styles.label, { fontFamily: fonts.mono, color: colors.scarlet }]}>
        {label}
      </Text>
      <Text style={[styles.body, { fontFamily: fonts.display, color: '#FAF9F6' }]}>
        {body}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    zIndex: 9999,
    gap: 5,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2.5,
  },
  body: {
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
});
