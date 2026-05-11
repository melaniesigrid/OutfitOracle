import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { StyleProfile, STYLE_KEYWORDS, BUDGET_TIERS, BudgetTier } from '../hooks/useStyleProfile';
import { colors, fonts, spacing } from '../theme';

interface Props {
  onSave: (profile: StyleProfile) => void;
  onSkip: () => void;
}

export function StyleOnboarding({ onSave, onSkip }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [budget, setBudget] = useState<BudgetTier | null>(null);

  const toggleKeyword = (kw: string) => {
    setKeywords(prev =>
      prev.includes(kw)
        ? prev.filter(k => k !== kw)
        : prev.length < 3 ? [...prev, kw] : prev,
    );
  };

  const handleSave = () => {
    if (!budget) return;
    onSave({ keywords, budget });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />

      <View style={styles.masthead}>
        <Text style={styles.mastheadKicker}>— PERSONALISE YOUR ORACLE —</Text>
        <Text style={styles.mastheadTitle1}>OUTFIT</Text>
        <Text style={styles.mastheadTitle2}>Oracle</Text>
        <View style={styles.mastheadRule} />
        <Text style={styles.mastheadStep}>Step {step} of 2</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <>
            <Text style={styles.stepLabel}>YOUR AESTHETIC</Text>
            <Text style={styles.stepTitle}>Pick up to 3 styles</Text>
            <Text style={styles.stepNote}>
              The Oracle will tailor every recommendation to your taste.
            </Text>

            <View style={styles.keywordGrid}>
              {STYLE_KEYWORDS.map(kw => {
                const selected = keywords.includes(kw);
                return (
                  <Pressable
                    key={kw}
                    style={[styles.kwChip, selected && styles.kwChipSelected]}
                    onPress={() => toggleKeyword(kw)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={kw}
                  >
                    <Text style={[styles.kwChipText, selected && styles.kwChipTextSelected]}>
                      {kw}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.primaryBtn, keywords.length === 0 && styles.btnDisabled]}
              onPress={() => setStep(2)}
              disabled={keywords.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Next: choose budget"
              accessibilityState={{ disabled: keywords.length === 0 }}
            >
              <Text style={styles.primaryBtnText}>Next</Text>
              <Text style={styles.primaryBtnArrow}>→</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.stepLabel}>YOUR BUDGET</Text>
            <Text style={styles.stepTitle}>Choose your tier</Text>
            <Text style={styles.stepNote}>
              The Oracle sources suggestions that fit your investment level.
            </Text>

            <View style={styles.budgetList}>
              {BUDGET_TIERS.map(tier => {
                const selected = budget === tier.id;
                return (
                  <Pressable
                    key={tier.id}
                    style={[styles.budgetRow, selected && styles.budgetRowSelected]}
                    onPress={() => setBudget(tier.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${tier.label} — ${tier.note}`}
                  >
                    <View style={styles.budgetRowContent}>
                      <Text style={[styles.budgetLabel, selected && styles.budgetLabelSelected]}>
                        {tier.label}
                      </Text>
                      <Text style={styles.budgetNote}>{tier.note}</Text>
                    </View>
                    {selected && <Text style={styles.budgetCheck}>&#10003;</Text>}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.stepActions}>
              <Pressable
                style={styles.backBtn}
                onPress={() => setStep(1)}
                accessibilityRole="button"
                accessibilityLabel="Go back to style keywords"
              >
                <Text style={styles.backBtnText}>← Back</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, !budget && styles.btnDisabled]}
                onPress={handleSave}
                disabled={!budget}
                accessibilityRole="button"
                accessibilityLabel="Save style profile"
                accessibilityState={{ disabled: !budget }}
              >
                <Text style={styles.primaryBtnText}>Save</Text>
                <Text style={styles.primaryBtnArrow}>→</Text>
              </Pressable>
            </View>
          </>
        )}

        <Pressable
          style={styles.skipBtn}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip personalisation"
          accessibilityHint="You can set your style profile later"
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },

  masthead: {
    backgroundColor: colors.bgDark,
    paddingTop: Platform.OS === 'ios' ? 68 : 44,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  mastheadKicker: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 3,
    color: 'rgba(250,249,246,0.30)',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  mastheadTitle1: {
    fontFamily: fonts.displayLight,
    fontSize: 58,
    color: '#FAF9F6',
    lineHeight: 56,
    letterSpacing: 8,
  },
  mastheadTitle2: {
    fontFamily: fonts.display,
    fontSize: 80,
    color: '#FAF9F6',
    lineHeight: 82,
    letterSpacing: -3,
  },
  mastheadRule: {
    height: 1,
    backgroundColor: 'rgba(250,249,246,0.12)',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  mastheadStep: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(250,249,246,0.35)',
    textAlign: 'right',
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 80,
  },

  stepLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  stepTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  stepNote: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.xl,
  },

  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  kwChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kwChipSelected: {
    backgroundColor: colors.bgDark,
    borderColor: colors.bgDark,
  },
  kwChipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  kwChipTextSelected: {
    color: '#FAF9F6',
  },

  budgetList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  budgetRowSelected: {
    borderColor: colors.borderHard,
    borderLeftWidth: 3,
    borderLeftColor: colors.scarlet,
  },
  budgetRowContent: {
    flex: 1,
  },
  budgetLabel: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  budgetLabelSelected: {
    color: colors.textPrimary,
  },
  budgetNote: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  budgetCheck: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.scarlet,
    marginLeft: spacing.sm,
  },

  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  backBtnText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },

  primaryBtn: {
    backgroundColor: colors.bgDark,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  primaryBtnText: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: '#FAF9F6',
    letterSpacing: 0.3,
  },
  primaryBtnArrow: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: 'rgba(250,249,246,0.55)',
  },

  skipBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  skipText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
});
