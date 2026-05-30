import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { OracleVerdict } from '../services/oracle';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  verdict: OracleVerdict;
}

export function VerdictCard({ verdict }: Props) {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const filled = verdict.rating;

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const dashOpacities = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      // Stagger each dash after card entrance settles (400ms head-start + 75ms per dash)
      ...dashOpacities.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          delay: 400 + i * 75,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      {/* Eyebrow */}
      <View style={styles.eyebrow}>
        <View style={styles.eyebrowLine} />
        <Text style={styles.eyebrowText}>THE ORACLE SPEAKS</Text>
        <View style={styles.eyebrowLine} />
      </View>

      {/* Vibe name — the headline */}
      <Text style={styles.vibeName}>{verdict.vibe}</Text>

      {/* Scarlet rule */}
      <View style={styles.scarletRule} />

      {/* Pull quote */}
      <Text style={styles.verdictText}>"{verdict.verdict}"</Text>

      <View style={styles.rule} />

      {/* Rating row */}
      <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>POLISH</Text>
        <View style={styles.ratingDashes}>
          {Array.from({ length: 5 }, (_, i) => (
            <Animated.View
              key={i}
              style={[styles.dash, i < filled ? styles.dashFilled : styles.dashEmpty, { opacity: dashOpacities[i] }]}
            />
          ))}
        </View>
        <Text style={styles.ratingNum}>{filled} / 5</Text>
      </View>
    </Animated.View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.xl,
    },
    eyebrow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    eyebrowLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderHard,
    },
    eyebrowText: {
      fontFamily: fonts.mono,
      fontSize: 12,
      letterSpacing: 2.5,
      color: colors.textMuted,
    },
    vibeName: {
      fontFamily: fonts.displayLight,
      fontSize: 52,
      color: colors.textPrimary,
      lineHeight: 56,
      letterSpacing: -1.5,
      marginBottom: spacing.md,
    },
    scarletRule: {
      height: 1,
      backgroundColor: colors.scarlet,
      marginBottom: spacing.lg,
    },
    verdictText: {
      fontFamily: fonts.serif,
      fontSize: 20,
      fontStyle: 'italic',
      color: colors.textPrimary,
      lineHeight: 32,
      marginBottom: spacing.lg,
    },
    rule: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    ratingLabel: {
      fontFamily: fonts.mono,
      fontSize: 12,
      letterSpacing: 2,
      color: colors.textMuted,
    },
    ratingDashes: {
      flexDirection: 'row',
      gap: 4,
      flex: 1,
    },
    dash: {
      flex: 1,
      height: 2,
    },
    dashFilled: {
      backgroundColor: colors.textPrimary,
    },
    dashEmpty: {
      backgroundColor: colors.border,
    },
    ratingNum: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.textMuted,
      letterSpacing: 1,
    },
  });
}
