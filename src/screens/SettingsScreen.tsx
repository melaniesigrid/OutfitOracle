import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Platform, StatusBar, Alert, Linking, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppData } from '../contexts/AppContext';
import { AppColors, AppFonts, ThemeName, THEMES, spacing, isY2KTheme, isMondrianTheme } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { MondrianSettingsScreen } from './mondrian/MondrianSettingsScreen';
import { useTempUnit, TempUnit } from '../contexts/TemperatureContext';
import { Y2KFontSubtheme, Y2K_SUBTHEME_LABELS } from '../theme/y2kTypography';
import {
  ANALYTICS_ENABLED_KEY,
  getAnalyticsEnabledPreference,
  setAnalyticsEnabledPreference,
} from '../services/analytics';

const ALL_KEYS = [
  '@outfit_oracle_history',
  '@outfit_oracle_first_consult',
  '@outfit_oracle_recent_cities',
  '@outfit_oracle_last_result',
  '@outfit_oracle_streak',
  '@outfit_oracle_style_profile',
  '@outfit_oracle_saved',
  '@onboarding_complete',
  '@outfit_oracle_founding_member',
  '@outfit_oracle_theme',
  '@outfit_oracle_temp_unit',
  '@outfit_oracle_y2k_font_subtheme',
  '@outfit_oracle_magic_shown',
  ANALYTICS_ENABLED_KEY,
];

const SOFT_KEYS = [
  '@outfit_oracle_history',
  '@outfit_oracle_first_consult',
  '@outfit_oracle_recent_cities',
  '@outfit_oracle_last_result',
  '@outfit_oracle_saved',
  '@outfit_oracle_magic_shown',
];

const APP_VERSION = Constants.expoConfig?.version ?? '1.1.0';
const PRIVACY_POLICY_URL = 'https://melaniesigrid.github.io/OutfitOracle/';

const THEME_OPTIONS: { id: ThemeName; label: string }[] = [
  { id: 'classic',          label: 'Classic' },
  { id: 'editorial-light',  label: 'Editorial Light' },
  { id: 'editorial-dark',   label: 'Editorial Dark' },
  { id: 'terra-firma',      label: 'Terra Firma' },
  { id: 'morning-paper',    label: 'Morning Paper' },
  { id: 'golden-hour',      label: 'Golden Hour' },
  { id: 'electric',         label: 'Electric' },
  { id: 'y2k',              label: 'Y2K ♡' },
  { id: 'neo-brutal-light', label: 'Neo-Brutal Light' },
  { id: 'neo-brutal-dark',  label: 'Neo-Brutal Dark' },
  { id: 'mondrian',         label: 'Mondrian' },
];

const Y2K_FONT_OPTIONS: { id: Y2KFontSubtheme; label: string; sub: string }[] = [
  { id: 'decree', label: 'Decree',  sub: 'Syne · Cormorant' },
  { id: 'club',   label: 'Club ♡',  sub: 'Baloo 2 · Knewave' },
];

const TEMP_OPTIONS: { id: TempUnit; label: string }[] = [
  { id: 'C', label: '°C' },
  { id: 'F', label: '°F' },
];

export function SettingsScreen() {
  const { themeName } = useTheme();
  if (isMondrianTheme(themeName)) return <MondrianSettingsScreen />;
  return <EditorialSettingsScreen />;
}

function EditorialSettingsScreen() {
  const { colors, fonts, themeName, setTheme, y2kFontSubtheme, setY2KFontSubtheme } = useTheme();
  const { unit: tempUnit, setUnit: setTempUnit } = useTempUnit();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const navigation = useNavigation<any>();
  const { historyCtx } = useAppData();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const showY2KFonts = isY2KTheme(themeName);

  useEffect(() => {
    let mounted = true;
    getAnalyticsEnabledPreference()
      .then(enabled => {
        if (mounted) setAnalyticsEnabled(enabled);
      })
      .catch(() => {
        if (mounted) setAnalyticsEnabled(true);
      });
    return () => { mounted = false; };
  }, []);

  function updateAnalyticsEnabled(enabled: boolean) {
    setAnalyticsEnabled(enabled);
    setAnalyticsEnabledPreference(enabled).catch(() => {
      setAnalyticsEnabled(!enabled);
      Alert.alert('Setting not saved', 'The analytics preference could not be updated. Please try again.');
    });
  }

  async function clearHistory() {
    Alert.alert(
      'Clear Outfit History',
      'This removes your consultation history, recent cities, and cached result. Your style profile and streak are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await Promise.all(SOFT_KEYS.map(k => AsyncStorage.removeItem(k)));
            historyCtx.clear();
            Alert.alert('Done', 'History cleared.');
          },
        },
      ],
    );
  }

  async function resetAll() {
    Alert.alert(
      'Reset Everything',
      'This deletes all your data — history, streak, style profile, and onboarding progress. The app will restart from scratch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await Promise.all(ALL_KEYS.map(k => AsyncStorage.removeItem(k)));
            historyCtx.clear();
            Alert.alert('Done', 'All data removed. Please close and reopen Outfit Oracle.');
          },
        },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close settings"
        >
          <MaterialCommunityIcons name="close" size={20} color="rgba(250,249,246,0.60)" />
        </Pressable>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── ORACLE THEME ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ORACLE THEME</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(opt => {
              const active = themeName === opt.id;
              const t = THEMES[opt.id];
              return (
                <Pressable
                  key={opt.id}
                  style={[styles.themeChip, active && styles.themeChipActive]}
                  onPress={() => setTheme(opt.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={opt.label}
                >
                  <View style={styles.themeChipPalette}>
                    <View style={[styles.paletteBlock, { backgroundColor: t.colors.bg }]} />
                    <View style={[styles.paletteBlock, { backgroundColor: t.colors.scarlet }]} />
                    <View style={[styles.paletteBlock, { backgroundColor: t.colors.bgDark }]} />
                  </View>
                  <Text style={[styles.themeChipText, active && styles.themeChipTextActive]} numberOfLines={1}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── TEMPERATURE ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TEMPERATURE</Text>
          <View style={styles.toggleRow}>
            {TEMP_OPTIONS.map(opt => {
              const active = tempUnit === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[styles.toggleChip, active && styles.toggleChipActive]}
                  onPress={() => setTempUnit(opt.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={opt.label}
                >
                  <Text style={[styles.toggleChipText, active && styles.toggleChipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Y2K FONT STYLE (only when Y2K theme active) ── */}
        {showY2KFonts && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Y2K FONT STYLE</Text>
            <View style={styles.toggleRow}>
              {Y2K_FONT_OPTIONS.map(opt => {
                const active = y2kFontSubtheme === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[styles.y2kChip, active && styles.y2kChipActive]}
                    onPress={() => setY2KFontSubtheme(opt.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={opt.label}
                  >
                    <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.themeChipText, { fontSize: 11, opacity: 0.6, marginTop: 2 }]}>
                      {opt.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ── DATA ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>

          <Pressable
            style={styles.row}
            onPress={clearHistory}
            accessibilityRole="button"
            accessibilityLabel="Clear outfit history"
          >
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="history" size={16} color="rgba(250,249,246,0.50)" />
              <View>
                <Text style={styles.rowText}>Clear outfit history</Text>
                <Text style={styles.rowSub}>Keeps streak and style profile</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(250,249,246,0.25)" />
          </Pressable>

          <View style={styles.rowDivider} />

          <Pressable
            style={styles.row}
            onPress={resetAll}
            accessibilityRole="button"
            accessibilityLabel="Reset all app data"
          >
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="delete-outline" size={16} color={colors.scarlet} />
              <View>
                <Text style={[styles.rowText, styles.rowTextDanger]}>Reset all data</Text>
                <Text style={styles.rowSub}>Removes everything, including profile</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(196,18,48,0.40)" />
          </Pressable>
        </View>

        {/* ── ANALYTICS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ANALYTICS</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="chart-line" size={16} color="rgba(250,249,246,0.50)" />
              <View>
                <Text style={styles.rowText}>Usage analytics</Text>
                <Text style={styles.rowSub}>Helps improve the Oracle. No personal data.</Text>
              </View>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={updateAnalyticsEnabled}
              trackColor={{ false: 'rgba(250,249,246,0.15)', true: colors.scarlet }}
              thumbColor="#FAF9F6"
            />
          </View>
        </View>

        {/* ── ABOUT ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="information-outline" size={16} color="rgba(250,249,246,0.50)" />
              <Text style={styles.rowText}>Version</Text>
            </View>
            <Text style={styles.rowValue}>{APP_VERSION}</Text>
          </View>

          <View style={styles.rowDivider} />

          <Pressable
            style={styles.row}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            accessibilityRole="link"
            accessibilityLabel="Open privacy policy"
          >
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="shield-outline" size={16} color="rgba(250,249,246,0.50)" />
              <Text style={styles.rowText}>Privacy policy</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={14} color="rgba(250,249,246,0.25)" />
          </Pressable>

          <View style={styles.rowDivider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={16} color="rgba(250,249,246,0.50)" />
              <Text style={styles.rowText}>Weather data</Text>
            </View>
            <Text style={styles.rowValue}>Open-Meteo</Text>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="brain" size={16} color="rgba(250,249,246,0.50)" />
              <Text style={styles.rowText}>AI model</Text>
            </View>
            <Text style={styles.rowValue}>Claude Sonnet 4.6</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Outfit Oracle is powered by Anthropic's Claude AI and Open-Meteo weather data.
          No personally identifiable information is collected or stored on our servers.
        </Text>

      </ScrollView>
    </View>
  );
}

const HEADER_TOP = Platform.OS === 'ios' ? 56 : 32;

function makeStyles(colors: AppColors, fonts: AppFonts) {
  // Settings always renders on a dark surface for contrast against the main UI
  const onDark = 'rgba(250,249,246,';
  const text    = `${onDark}0.85)`;
  const textSub = `${onDark}0.35)`;
  const border  = `${onDark}0.09)`;
  const divider = `${onDark}0.06)`;
  const icon    = `${onDark}0.50)`;

  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: HEADER_TOP,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: divider,
  },
  closeBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 3,
    color: textSub,
  },
  content: {
    paddingVertical: spacing.lg,
    paddingBottom: 48,
  },

  /* Sections */
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: border,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2.5,
    color: textSub,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: divider,
  },

  /* Rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 56,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  rowText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: text,
    letterSpacing: 0.3,
  },
  rowTextDanger: {
    color: colors.scarletFg ?? colors.scarlet,
  },
  rowSub: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: textSub,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  rowValue: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: textSub,
    letterSpacing: 0.5,
  },
  rowDivider: {
    height: 1,
    backgroundColor: divider,
    marginHorizontal: spacing.md,
  },

  /* Theme picker — 2-col grid with palette preview */
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  themeChip: {
    width: '47%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: border,
    gap: 6,
  },
  themeChipPalette: {
    flexDirection: 'row',
    height: 12,
    overflow: 'hidden',
    borderRadius: 1,
  },
  paletteBlock: { flex: 1 },
  themeChipActive: {
    borderColor: colors.scarlet,
    backgroundColor: `${colors.scarlet}14`,
  },
  themeChipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: textSub,
  },
  themeChipTextActive: {
    color: text,
  },

  /* Temperature / Y2K font toggle */
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  toggleChip: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: border,
  },
  toggleChipActive: {
    borderColor: colors.scarlet,
    backgroundColor: `${colors.scarlet}18`,
  },
  toggleChipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: textSub,
    letterSpacing: 0.5,
  },
  toggleChipTextActive: { color: text },

  /* Y2K font picker (2-col with subtitle) */
  y2kChip: {
    width: '47%',
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: border,
  },
  y2kChipActive: {
    borderColor: colors.scarlet,
    backgroundColor: `${colors.scarlet}18`,
  },

  /* Footer */
  footer: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: `${onDark}0.18)`,
    letterSpacing: 0.3,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
}); }
