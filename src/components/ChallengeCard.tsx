import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeeklyChallengeState } from '../hooks/useWeeklyChallenge';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  state: WeeklyChallengeState;
}

export function ChallengeCard({ state }: Props) {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const { challenge, completed, daysLeft } = state;

  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!completed) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [completed]);

  const completedOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <View style={[styles.card, completed && styles.cardComplete]}>
      {/* Left accent strip */}
      <View style={[styles.accent, completed && styles.accentComplete]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={[styles.kicker, completed && styles.kickerComplete]}>
            {completed ? 'CHALLENGE COMPLETE' : 'THIS WEEK\'S CHALLENGE'}
          </Text>
          {completed ? (
            <Animated.View style={{ opacity: completedOpacity }}>
              <MaterialCommunityIcons name="check-circle" size={14} color={colors.scarlet} />
            </Animated.View>
          ) : (
            <Text style={styles.daysLeft}>
              {daysLeft === 1 ? 'LAST DAY' : `${daysLeft}D LEFT`}
            </Text>
          )}
        </View>

        {/* Week progress bar — days elapsed this week */}
        {!completed && (
          <View style={styles.weekBar}>
            <View
              style={[
                styles.weekBarFill,
                { width: `${Math.round(((7 - daysLeft) / 7) * 100)}%` as any },
              ]}
            />
          </View>
        )}

        {/* Challenge title */}
        <Text style={[styles.title, completed && styles.titleComplete]}>
          {challenge.title}
        </Text>

        {/* Brief — only show when not yet complete */}
        {!completed && (
          <Text style={styles.brief}>{challenge.brief}</Text>
        )}

        {/* Completion message */}
        {completed && (
          <Text style={styles.completedMsg}>
            The Oracle notes the consistency. Well dressed.
          </Text>
        )}
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    card: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      flexDirection: 'row',
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardComplete: {
      backgroundColor: colors.scarletDim,
      borderColor: colors.scarlet,
    },
    accent: {
      width: 3,
      backgroundColor: colors.border,
    },
    accentComplete: {
      backgroundColor: colors.scarlet,
    },
    body: {
      flex: 1,
      padding: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    kicker: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 2,
      color: colors.textMuted,
    },
    kickerComplete: {
      color: colors.scarlet,
    },
    daysLeft: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 1,
      color: colors.textMuted,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 20,
      color: colors.textPrimary,
      letterSpacing: -0.3,
      lineHeight: 24,
      marginBottom: 5,
    },
    titleComplete: {
      color: colors.scarlet,
    },
    weekBar: {
      height: 2,
      backgroundColor: colors.border,
      marginBottom: 8,
    },
    weekBarFill: {
      height: 2,
      backgroundColor: colors.textMuted,
    },
    brief: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
      letterSpacing: 0.1,
    },
    completedMsg: {
      fontFamily: fonts.serif,
      fontSize: 12,
      color: colors.scarlet,
      fontStyle: 'italic',
      lineHeight: 18,
    },
  });
}
