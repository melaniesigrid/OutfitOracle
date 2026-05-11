import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, Platform, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAppData } from '../contexts/AppContext';
import {
  STYLE_KEYWORDS, BUDGET_TIERS, PERSONALITY_OPTIONS,
  OraclePersonality, BudgetTier,
} from '../hooks/useStyleProfile';
import { colors, fonts, spacing } from '../theme';

export function ProfileEditScreen() {
  const navigation = useNavigation();
  const { profileCtx } = useAppData();
  const existing = profileCtx.profile;

  const [name,        setName]        = useState(existing?.name ?? '');
  const [keywords,    setKeywords]    = useState<string[]>(existing?.keywords ?? []);
  const [budget,      setBudget]      = useState<BudgetTier>(existing?.budget ?? 'contemporary');
  const [personality, setPersonality] = useState<OraclePersonality>(existing?.personality ?? 'editorial');

  const toggleKeyword = (kw: string) => {
    Haptics.selectionAsync();
    setKeywords(prev =>
      prev.includes(kw) ? prev.filter(k => k !== kw) : prev.length < 3 ? [...prev, kw] : prev,
    );
  };

  const save = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    profileCtx.saveProfile({ keywords, budget, name: name.trim() || undefined, personality });
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>YOUR PROFILE</Text>
        <Pressable onPress={save} accessibilityRole="button" accessibilityLabel="Save profile">
          <Text style={styles.saveBtn}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>YOUR NAME</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="How should the Oracle address you?"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            returnKeyType="done"
          />
          <View style={styles.fieldRule} />
          <Text style={styles.fieldHint}>Used in your personalised greeting on the Today screen.</Text>
        </View>

        {/* Aesthetic keywords */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>YOUR AESTHETIC — pick up to 3</Text>
          <View style={styles.chips}>
            {STYLE_KEYWORDS.map(kw => {
              const active = keywords.includes(kw);
              const maxed  = !active && keywords.length >= 3;
              return (
                <Pressable
                  key={kw}
                  style={[styles.chip, active && styles.chipActive, maxed && styles.chipMaxed]}
                  onPress={() => !maxed && toggleKeyword(kw)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active, disabled: maxed }}
                  accessibilityLabel={kw}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {kw}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Budget */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>BUDGET TIER</Text>
          {BUDGET_TIERS.map(tier => {
            const active = budget === tier.id;
            return (
              <Pressable
                key={tier.id}
                style={[styles.budgetRow, active && styles.budgetRowActive]}
                onPress={() => { Haptics.selectionAsync(); setBudget(tier.id); }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={tier.label}
              >
                <View style={styles.budgetLeft}>
                  <Text style={[styles.budgetLabel, active && styles.budgetLabelActive]}>{tier.label}</Text>
                  <Text style={styles.budgetNote}>{tier.note}</Text>
                </View>
                {active && <View style={styles.budgetDot} />}
              </Pressable>
            );
          })}
        </View>

        {/* Personality */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>ORACLE VOICE</Text>
          {PERSONALITY_OPTIONS.map(opt => {
            const active = personality === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[styles.personalityRow, active && styles.personalityRowActive]}
                onPress={() => { Haptics.selectionAsync(); setPersonality(opt.id); }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={opt.title}
              >
                <View style={styles.personalityLeft}>
                  <Text style={[styles.personalityTitle, active && styles.personalityTitleActive]}>
                    {opt.title}
                  </Text>
                  <Text style={styles.personalityQuote}>{opt.quote}</Text>
                </View>
                {active && <View style={styles.budgetDot} />}
              </Pressable>
            );
          })}
        </View>

        {/* Save */}
        <Pressable
          style={({ pressed }) => [styles.saveFullBtn, pressed && { opacity: 0.8 }]}
          onPress={save}
          accessibilityRole="button"
          accessibilityLabel="Save profile"
        >
          <Text style={styles.saveFullBtnText}>Save Profile →</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { fontFamily: fonts.mono, fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5 },
  headerTitle: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2.5, color: colors.textMuted },
  saveBtn: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.scarlet, letterSpacing: 0.5 },
  content: { paddingBottom: 60 },

  field: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  nameInput: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    paddingVertical: spacing.sm,
  },
  fieldRule: { height: 1, backgroundColor: colors.borderHard, marginBottom: spacing.sm },
  fieldHint: { fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted, letterSpacing: 0.3, lineHeight: 15 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { borderColor: colors.textPrimary, backgroundColor: colors.bgSurface },
  chipMaxed: { opacity: 0.35 },
  chipText: { fontFamily: fonts.mono, fontSize: 11, color: colors.textSecondary, letterSpacing: 0.3 },
  chipTextActive: { color: colors.textPrimary },

  budgetRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  budgetRowActive: { backgroundColor: colors.bgSurface },
  budgetLeft: { flex: 1 },
  budgetLabel: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.textSecondary, letterSpacing: -0.2 },
  budgetLabelActive: { color: colors.textPrimary },
  budgetNote: { fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted, letterSpacing: 0.3, marginTop: 2 },
  budgetDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.scarlet },

  personalityRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  personalityRowActive: { backgroundColor: colors.bgSurface },
  personalityLeft: { flex: 1 },
  personalityTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.textSecondary, letterSpacing: -0.2 },
  personalityTitleActive: { color: colors.textPrimary },
  personalityQuote: { fontFamily: fonts.serif, fontSize: 13, color: colors.scarlet, marginTop: 2, letterSpacing: -0.1 },

  saveFullBtn: {
    marginHorizontal: spacing.lg, marginTop: spacing.xl,
    backgroundColor: colors.bgDark, paddingVertical: 18, alignItems: 'center',
  },
  saveFullBtnText: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: '#FAF9F6' },
});
