import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme';

const OPTIONS = ['Women', 'Men', 'Anyone'] as const;
export type Gender = typeof OPTIONS[number];

interface Props {
  selected: Gender;
  onChange: (g: Gender) => void;
}

export function GenderToggle({ selected, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>DRESSING FOR</Text>
      <View style={styles.chips}>
        {OPTIONS.map(opt => {
          const active = selected === opt;
          return (
            <Pressable
              key={opt}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(opt)}
              accessibilityRole="button"
              accessibilityLabel={`Dressing for ${opt}`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
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
