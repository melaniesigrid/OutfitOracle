import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  entryId: string | null;
  existingRating?: 1 | 2 | 3 | 4 | 5;
  onRate: (entryId: string, rating: 1 | 2 | 3 | 4 | 5) => void;
}

export function OutfitRatingPrompt({ entryId, existingRating, onRate }: Props) {
  const { colors, fonts } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!entryId) return;
    const delay = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 2000);
    return () => clearTimeout(delay);
  }, [entryId]);

  if (!entryId) return null;

  const handleRate = (rating: 1 | 2 | 3 | 4 | 5) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onRate(entryId, rating);
  };

  const stars: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

  return (
    <Animated.View style={[styles.wrap, { opacity, borderColor: colors.border }]}>
      <Text style={[styles.label, { fontFamily: fonts.mono, color: colors.textMuted }]}>
        DID THE ORACLE GET IT RIGHT?
      </Text>
      <View style={styles.stars}>
        {stars.map(star => {
          const filled = existingRating != null && star <= existingRating;
          return (
            <Pressable
              key={star}
              onPress={() => handleRate(star)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${star} out of 5`}
            >
              <Text style={[
                styles.star,
                { color: filled ? colors.scarletFg : colors.border },
              ]}>
                {filled ? '★' : '☆'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {existingRating != null && (
        <Text style={[styles.thanks, { fontFamily: fonts.serif, color: colors.textMuted }]}>
          {existingRating >= 4
            ? 'The Oracle notes your approval.'
            : existingRating === 3
            ? 'The Oracle acknowledges the ambiguity.'
            : 'The Oracle will reflect on this.'}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2.5,
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  star: {
    fontSize: 28,
  },
  thanks: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
