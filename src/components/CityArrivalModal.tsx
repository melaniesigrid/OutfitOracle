import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { AppColors, AppFonts, spacing } from '../theme';

interface Props {
  city: string;
  country: string;
  isFashionCapital: boolean;
  descriptor: string | null;
  visible: boolean;
  onCollect: () => void;
  onDismiss: () => void;
}

export function CityArrivalModal({ city, country, isFashionCapital, descriptor, visible, onCollect, onDismiss }: Props) {
  const { colors, fonts } = useTheme();
  const styles = makeStyles(colors, fonts);
  const translateY = useRef(new Animated.Value(440)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 440, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]).start();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0, duration: 520,
        easing: Easing.out(Easing.back(1.6)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    dismissTimer.current = setTimeout(onDismiss, 9000);
    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
  }, [visible]);

  if (!visible) return null;

  const header = isFashionCapital
    ? 'THE ORACLE MARKS YOUR ARRIVAL AT A FASHION CAPITAL.'
    : 'THE ORACLE MARKS YOUR ARRIVAL.';

  return (
    <Animated.View
      style={[styles.backdrop, { opacity }]}
      pointerEvents="box-none"
    >
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={[styles.accentBar, isFashionCapital && styles.accentBarGold]} />

        <View style={styles.top}>
          <Text style={styles.cityName}>{city}</Text>
          <Text style={styles.country}>{country.toUpperCase()}</Text>
        </View>

        <View style={styles.rule} />

        <Text style={[styles.header, isFashionCapital && styles.headerGold]}>{header}</Text>

        {descriptor ? (
          <Text style={styles.descriptor}>{descriptor}</Text>
        ) : (
          <View style={styles.descriptorPlaceholder}>
            <View style={[styles.placeholderLine, { width: '80%' }]} />
            <View style={[styles.placeholderLine, { width: '55%', marginTop: 6 }]} />
          </View>
        )}

        <View style={styles.rule} />

        <View style={styles.actions}>
          <Pressable
            style={styles.collectBtn}
            onPress={onCollect}
            accessibilityRole="button"
            accessibilityLabel="Collect your passport page"
          >
            <Text style={styles.collectBtnText}>COLLECT PASSPORT PAGE →</Text>
          </Pressable>
          <Pressable
            style={styles.dismissBtn}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          >
            <Text style={styles.dismissText}>dismiss</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.55)',
      zIndex: 9998,
    },
    sheet: {
      backgroundColor: colors.bg,
      paddingBottom: spacing.xl + spacing.lg,
      paddingTop: 0,
    },
    accentBar: {
      height: 3,
      backgroundColor: colors.scarlet,
    },
    accentBarGold: {
      backgroundColor: '#C4943A',
    },
    top: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    cityName: {
      fontFamily: fonts.display,
      fontSize: 52,
      color: colors.textPrimary,
      letterSpacing: -1.5,
      lineHeight: 56,
    },
    country: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 2.5,
      color: colors.textMuted,
      marginTop: 4,
    },
    rule: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.lg,
    },
    header: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 2,
      color: colors.scarletFg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerGold: {
      color: '#C4943A',
    },
    descriptor: {
      fontFamily: fonts.serif,
      fontSize: 15,
      fontStyle: 'italic',
      color: colors.textSecondary,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      lineHeight: 22,
    },
    descriptorPlaceholder: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    placeholderLine: {
      height: 14,
      borderRadius: 2,
      backgroundColor: colors.border,
      opacity: 0.5,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.lg,
    },
    collectBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.textPrimary,
      paddingVertical: spacing.sm + 2,
      alignItems: 'center',
    },
    collectBtnText: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 1.5,
      color: colors.textPrimary,
    },
    dismissBtn: {
      paddingVertical: spacing.sm,
    },
    dismissText: {
      fontFamily: fonts.serif,
      fontSize: 13,
      fontStyle: 'italic',
      color: colors.textMuted,
    },
  });
}
