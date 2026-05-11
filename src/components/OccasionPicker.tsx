import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, spacing } from '../theme';

const OPTIONS = ['Any', 'Work', 'Date', 'Event', 'Weekend', 'Active'] as const;
export type Occasion = typeof OPTIONS[number];

interface Props {
  selected: Occasion;
  onChange: (o: Occasion) => void;
}

export function OccasionPicker({ selected, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>OCCASION</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {OPTIONS.map(opt => {
          const active = selected === opt;
          return (
            <Pressable
              key={opt}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(opt)}
              accessibilityRole="button"
              accessibilityLabel={`Occasion: ${opt}`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2.5,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.bgDark,
    borderColor: colors.bgDark,
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: '#FAF9F6',
  },
});
