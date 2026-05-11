import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CitySuggestion } from '../services/weather';
import { colors, fonts, spacing } from '../theme';

interface Props {
  suggestions: CitySuggestion[];
  onSelect: (name: string) => void;
}

export function CitySuggestions({ suggestions, onSelect }: Props) {
  if (!suggestions.length) return null;

  return (
    <View style={styles.container}>
      {suggestions.map((s, i) => (
        <Pressable
          key={`${s.name}-${s.country}-${i}`}
          style={({ pressed }) => [
            styles.row,
            i < suggestions.length - 1 && styles.rowBorder,
            pressed && styles.rowPressed,
          ]}
          onPress={() => onSelect(s.name)}
          accessibilityRole="button"
          accessibilityLabel={`Select ${s.displayName}`}
        >
          <Text style={styles.name}>{s.name}</Text>
          {(s.region || s.country) ? (
            <Text style={styles.meta}>
              {[s.region, s.country].filter(Boolean).join(', ')}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.bgSurface,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
