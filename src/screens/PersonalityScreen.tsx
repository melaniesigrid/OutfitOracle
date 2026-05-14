import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform,
  StatusBar, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { PERSONALITY_OPTIONS, OraclePersonality } from '../hooks/useStyleProfile';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  onSelect: (personality: OraclePersonality) => void;
}

export function PersonalityScreen({ onSelect }: Props) {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const [selected, setSelected] = useState<OraclePersonality>('editorial');

  const confirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(selected);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.kicker}>STEP 1 OF 2</Text>
        <Text style={styles.headline}>Choose{'\n'}Your Oracle.</Text>
        <View style={styles.rule} />
        <Text style={styles.sub}>
          The Oracle speaks in many registers. Pick the voice that suits your sensibility.
          This can be changed at any time in your profile.
        </Text>

        <View style={styles.cards}>
          {PERSONALITY_OPTIONS.map(opt => {
            const active = selected === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelected(opt.id);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={opt.title}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                    {opt.title}
                  </Text>
                  {active && <View style={styles.selectedDot} />}
                </View>
                <Text style={styles.cardQuote}>{opt.quote}</Text>
                <Text style={styles.cardDesc}>{opt.desc}</Text>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={confirm}
          accessibilityRole="button"
          accessibilityLabel="Confirm Oracle personality"
        >
          <Text style={styles.btnText}>Confirm →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) { return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 68 : 44,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.textPrimary,
    lineHeight: 56,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sub: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 19,
    letterSpacing: 0.2,
    marginBottom: spacing.xl,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  cardActive: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.bgSurface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.textSecondary,
    letterSpacing: -0.3,
  },
  cardTitleActive: {
    color: colors.textPrimary,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.scarlet,
  },
  cardQuote: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.scarlet,
    fontStyle: 'italic',
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 17,
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btn: {
    backgroundColor: colors.bgDark,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.8 },
  btnText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: '#FAF9F6',
  },
}); }
