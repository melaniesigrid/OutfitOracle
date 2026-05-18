import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { StyleProfile, STYLE_KEYWORDS, BUDGET_TIERS, SIZE_OPTIONS, BudgetTier, ClothingSize } from '../hooks/useStyleProfile';
import { AppColors, AppFonts, ThemeName, isY2KTheme, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  onSave: (profile: StyleProfile) => void;
}

export function StyleOnboarding({ onSave }: Props) {
  const { colors, fonts, themeName } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts, themeName), [colors, fonts, themeName]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [budget, setBudget] = useState<BudgetTier | null>(null);
  const [name, setName] = useState('');
  const [size, setSize] = useState<ClothingSize | null>(null);

  const toggleKeyword = (kw: string) => {
    setKeywords(prev =>
      prev.includes(kw)
        ? prev.filter(k => k !== kw)
        : prev.length < 3 ? [...prev, kw] : prev,
    );
  };

  const handleSave = () => {
    if (!budget) return;
    onSave({ keywords, budget, name: name.trim() || undefined, size: size ?? undefined });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />

      <View style={styles.masthead}>
        <Text style={styles.mastheadKicker}>— PERSONALISE YOUR ORACLE —</Text>
        <Text style={styles.mastheadTitle1}>OUTFIT</Text>
        <Text style={styles.mastheadTitle2}>Oracle</Text>
        <View style={styles.mastheadRule} />
        <Text style={styles.mastheadStep}>Step {step} of 3</Text>
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
        ) : step === 2 ? (
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
                onPress={() => setStep(3)}
                disabled={!budget}
                accessibilityRole="button"
                accessibilityLabel="Next: add your name"
                accessibilityState={{ disabled: !budget }}
              >
                <Text style={styles.primaryBtnText}>Next</Text>
                <Text style={styles.primaryBtnArrow}>→</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.stepLabel}>YOUR SIZE</Text>
            <Text style={styles.stepTitle}>How do you fit?</Text>
            <Text style={styles.stepNote}>
              Optional. Helps the Oracle tailor picks to your proportions and fit preferences.
            </Text>

            <View style={styles.sizeRow}>
              {SIZE_OPTIONS.map(s => {
                const selected = size === s;
                return (
                  <Pressable
                    key={s}
                    style={[styles.sizeChip, selected && styles.sizeChipSelected]}
                    onPress={() => setSize(selected ? null : s)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={s}
                  >
                    <Text style={[styles.sizeChipText, selected && styles.sizeChipTextSelected]}>
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.stepLabel, { marginTop: 28 }]}>YOUR NAME</Text>
            <Text style={styles.stepNote}>
              Optional. You can change it later in your profile.
            </Text>

            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Melanie"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              accessibilityLabel="Your name"
            />

            <View style={styles.stepActions}>
              <Pressable
                style={styles.backBtn}
                onPress={() => setStep(2)}
                accessibilityRole="button"
                accessibilityLabel="Go back to budget"
              >
                <Text style={styles.backBtnText}>← Back</Text>
              </Pressable>
              <Pressable
                style={styles.primaryBtn}
                onPress={handleSave}
                accessibilityRole="button"
                accessibilityLabel={name.trim() ? 'Save style profile' : 'Skip name and save style profile'}
              >
                <Text style={styles.primaryBtnText}>{name.trim() ? 'Save' : 'Skip'}</Text>
                <Text style={styles.primaryBtnArrow}>→</Text>
              </Pressable>
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts, themeName: ThemeName) {
  const isY2K = isY2KTheme(themeName);

  return StyleSheet.create({
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
    fontSize: 11,
    letterSpacing: 3,
    color: 'rgba(250,249,246,0.30)',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  mastheadTitle1: {
    fontFamily: fonts.displayLight,
    fontSize: 58,
    color: '#FAF9F6',
    lineHeight: isY2K ? 74 : 56,
    letterSpacing: 8,
  },
  mastheadTitle2: {
    fontFamily: fonts.display,
    fontSize: 80,
    color: '#FAF9F6',
    lineHeight: isY2K ? 102 : 82,
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
    fontSize: 11,
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
    fontSize: 12,
    letterSpacing: 2.5,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  stepTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.textPrimary,
    lineHeight: isY2K ? 44 : 40,
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

  sizeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  sizeChip: {
    minWidth: 48,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sizeChipSelected: {
    backgroundColor: colors.bgDark,
    borderColor: colors.bgDark,
  },
  sizeChipText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  sizeChipTextSelected: {
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
    lineHeight: isY2K ? 34 : 30,
    letterSpacing: 0.2,
  },
  budgetLabelSelected: {
    color: colors.textPrimary,
  },
  budgetNote: {
    fontFamily: fonts.mono,
    fontSize: 12,
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

  nameInput: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderHard,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.textPrimary,
    lineHeight: isY2K ? 44 : 40,
    letterSpacing: -0.5,
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
    lineHeight: isY2K ? 28 : 24,
    letterSpacing: 0.3,
  },
  primaryBtnArrow: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: 'rgba(250,249,246,0.55)',
  },

  });
}
