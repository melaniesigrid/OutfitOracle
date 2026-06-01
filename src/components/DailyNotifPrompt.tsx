import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Easing, Modal, Pressable, StyleSheet, Text, View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

const TIME_OPTIONS: { label: string; sub: string; hour: number }[] = [
  { label: 'MORNING', sub: '8 AM',  hour: 8  },
  { label: 'NOON',    sub: '12 PM', hour: 12 },
  { label: 'EVENING', sub: '6 PM',  hour: 18 },
];

interface Props {
  visible: boolean;
  city: string;
  tempLabel: string;
  onEnable: (hour: number) => void;
  onDismiss: () => void;
}

export function DailyNotifPrompt({ visible, city, tempLabel, onEnable, onDismiss }: Props) {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [selectedHour, setSelectedHour] = useState(8);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.back(1.05)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  function handleEnable() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onEnable(selectedHour);
  }

  function handleDismiss() {
    Haptics.selectionAsync();
    onDismiss();
  }

  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={handleDismiss}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />

        <Text style={styles.eyebrow}>DAILY REMINDER</Text>
        <Text style={styles.headline}>The Oracle, daily.</Text>
        <Text style={styles.body}>
          Get{city ? ` ${city}` : ''}{tempLabel ? `, ${tempLabel}` : ''} — the Oracle has a verdict for you — delivered to your lock screen each morning.
        </Text>

        <Text style={styles.timeLabel}>SEND IT AT</Text>
        <View style={styles.timeRow}>
          {TIME_OPTIONS.map(opt => {
            const active = selectedHour === opt.hour;
            return (
              <Pressable
                key={opt.hour}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => { Haptics.selectionAsync(); setSelectedHour(opt.hour); }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${opt.label}, ${opt.sub}`}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{opt.label}</Text>
                <Text style={[styles.chipSub, active && styles.chipSubActive]}>{opt.sub}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [styles.enableBtn, pressed && { opacity: 0.84 }]}
          onPress={handleEnable}
          accessibilityRole="button"
          accessibilityLabel="Enable daily reminders"
        >
          <Text style={styles.enableText}>ENABLE REMINDERS</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.dismissBtn, pressed && { opacity: 0.6 }]}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Not now"
        >
          <Text style={styles.dismissText}>Not now</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(13,11,8,0.72)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.bg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: spacing.lg,
    },
    eyebrow: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 3,
      color: colors.scarletFg,
      marginBottom: spacing.xs,
    },
    headline: {
      fontFamily: fonts.display,
      fontSize: 36,
      lineHeight: 38,
      letterSpacing: -0.5,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    body: {
      fontFamily: fonts.serif,
      fontSize: 16,
      lineHeight: 23,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    timeLabel: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 2.5,
      color: colors.textMuted,
      marginBottom: spacing.sm,
    },
    timeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    chip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.textPrimary,
      borderColor: colors.textPrimary,
    },
    chipLabel: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 1.5,
      color: colors.textMuted,
    },
    chipLabelActive: {
      color: colors.bg,
    },
    chipSub: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 0.5,
      color: colors.textSecondary,
      marginTop: 2,
    },
    chipSubActive: {
      color: colors.bg,
    },
    enableBtn: {
      backgroundColor: colors.textPrimary,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    enableText: {
      fontFamily: fonts.monoMedium,
      fontSize: 12,
      letterSpacing: 2.5,
      color: colors.bg,
    },
    dismissBtn: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    dismissText: {
      fontFamily: fonts.mono,
      fontSize: 12,
      letterSpacing: 0.5,
      color: colors.textMuted,
    },
  });
}
