import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AppColors, AppFonts, spacing } from '../theme';

interface Props {
  city: string;
  visitCount: number;
  daysSinceLastVisit: number | null;
  lastVibe: string | null;
}

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

export function CityReturnBanner({ city, visitCount, daysSinceLastVisit, lastVibe }: Props) {
  const { colors, fonts } = useTheme();
  const styles = makeStyles(colors, fonts);
  const opacity = useRef(new Animated.Value(0)).current;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  if (dismissed) return null;

  const dayText = daysSinceLastVisit === 0
    ? 'earlier today'
    : daysSinceLastVisit === 1
    ? '1 day ago'
    : `${daysSinceLastVisit} days ago`;

  return (
    <Animated.View style={[styles.wrap, { opacity }]}>
      <View style={styles.inner}>
        <View style={styles.textBlock}>
          <Text style={styles.label}>ORACLE MEMORY</Text>
          <Text style={styles.body}>
            Your {ordinal(visitCount + 1)} visit to {city}.
            {lastVibe ? ` The Oracle last saw you here ${dayText} — "${lastVibe}".` : ''}
          </Text>
        </View>
        <Pressable onPress={() => setDismissed(true)} hitSlop={12} accessibilityLabel="Dismiss">
          <Text style={styles.dismiss}>×</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    wrap: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      gap: 8,
    },
    textBlock: {
      flex: 1,
      gap: 3,
    },
    label: {
      fontFamily: fonts.mono,
      fontSize: 9,
      letterSpacing: 2,
      color: colors.textMuted,
    },
    body: {
      fontFamily: fonts.serif,
      fontSize: 13,
      fontStyle: 'italic',
      color: colors.textSecondary,
      lineHeight: 18,
    },
    dismiss: {
      fontFamily: fonts.mono,
      fontSize: 16,
      color: colors.textMuted,
      lineHeight: 20,
    },
  });
}
