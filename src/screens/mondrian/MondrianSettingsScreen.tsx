import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  Platform, StatusBar, Alert, Linking, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppData } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { THEME_OPTIONS, THEMES, mondrianTokens, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useTempUnit, TempUnit } from '../../contexts/TemperatureContext';
import {
  getAnalyticsEnabledPreference,
  setAnalyticsEnabledPreference,
  ANALYTICS_ENABLED_KEY,
} from '../../services/analytics';
import { deleteAllLocalAuth } from '../../services/auth';

const { red, blue, yellow, black, white, gridLine } = mondrianTokens;

const ALL_KEYS = [
  '@outfit_oracle_history', '@outfit_oracle_first_consult',
  '@outfit_oracle_recent_cities', '@outfit_oracle_last_result',
  '@outfit_oracle_streak', '@outfit_oracle_style_profile',
  '@outfit_oracle_saved', '@onboarding_complete',
  '@outfit_oracle_founding_member', '@outfit_oracle_theme',
  '@outfit_oracle_temp_unit', '@outfit_oracle_y2k_font_subtheme',
  '@outfit_oracle_magic_shown', ANALYTICS_ENABLED_KEY,
];
const SOFT_KEYS = [
  '@outfit_oracle_history', '@outfit_oracle_first_consult',
  '@outfit_oracle_recent_cities', '@outfit_oracle_last_result',
  '@outfit_oracle_saved', '@outfit_oracle_magic_shown',
];

const APP_VERSION = Constants.expoConfig?.version ?? '1.1.0';
const PRIVACY_POLICY_URL = 'https://melaniesigrid.github.io/OutfitOracle/';

const TEMP_OPTIONS: { id: TempUnit; label: string }[] = [
  { id: 'C', label: '°C — Celsius' },
  { id: 'F', label: '°F — Fahrenheit' },
];

function GridLine() {
  return <View style={{ height: gridLine, backgroundColor: black }} />;
}

function SectionBar({ label, bg, textColor }: { label: string; bg: string; textColor: string }) {
  return (
    <View>
      <GridLine />
      <View style={{ backgroundColor: bg, paddingVertical: 8, paddingHorizontal: spacing.md }}>
        <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 12, letterSpacing: 2.5, color: textColor }}>
          {label}
        </Text>
      </View>
      <GridLine />
    </View>
  );
}

const HEADER_TOP = Platform.OS === 'ios' ? 56 : 32;

export function MondrianSettingsScreen() {
  const { themeName, setTheme } = useTheme();
  const { unit: tempUnit, setUnit: setTempUnit } = useTempUnit();
  const navigation = useNavigation<any>();
  const { historyCtx } = useAppData();
  const { user, signOut } = useAuth();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAnalyticsEnabledPreference()
      .then(v => { if (mounted) setAnalyticsEnabled(v); })
      .catch(() => { if (mounted) setAnalyticsEnabled(true); });
    return () => { mounted = false; };
  }, []);

  function updateAnalytics(enabled: boolean) {
    setAnalyticsEnabled(enabled);
    setAnalyticsEnabledPreference(enabled).catch(() => {
      setAnalyticsEnabled(!enabled);
      Alert.alert('Setting not saved', 'Please try again.');
    });
  }

  async function clearHistory() {
    Alert.alert(
      'Clear History',
      'Removes consultation history, recent cities, and cached result. Streak and style profile are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive',
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
      'Deletes all data — account, history, streak, style profile, and onboarding. The app restarts from scratch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => {
            await Promise.all(ALL_KEYS.map(k => AsyncStorage.removeItem(k)));
            await deleteAllLocalAuth();
            historyCtx.clear();
            await signOut();
            Alert.alert('Done', 'All data removed.');
          },
        },
      ],
    );
  }

  async function confirmSignOut() {
    Alert.alert(
      'Sign Out',
      'Your saved data stays on this device. You can log back in with this account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => { signOut(); } },
      ],
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={white} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <GridLine />
        <View style={s.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={s.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close settings"
          >
            <MaterialCommunityIcons name="close" size={22} color={black} />
          </Pressable>
          <Text style={s.headerTitle}>SETTINGS</Text>
          <View style={{ width: 36 }} />
        </View>
        <GridLine />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── ORACLE THEME ── */}
        <SectionBar label="ORACLE THEME" bg={red} textColor={white} />
        <View style={s.themeGrid}>
          {THEME_OPTIONS.map(opt => {
            const active = themeName === opt.id;
            const theme = THEMES[opt.id];
            const accentColor = theme.colors.scarlet;
            const bgColor = theme.colors.bg;
            return (
              <Pressable
                key={opt.id}
                style={[s.themeChip, active && s.themeChipActive]}
                onPress={() => setTheme(opt.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={opt.label}
              >
                {/* Color preview bar */}
                <View style={s.themeChipPalette}>
                  <View style={[s.paletteBlock, { backgroundColor: bgColor }]} />
                  <View style={[s.paletteBlock, { backgroundColor: accentColor }]} />
                  <View style={[s.paletteBlock, { backgroundColor: theme.colors.bgDark }]} />
                </View>
                <Text style={[s.themeChipText, active && s.themeChipTextActive]} numberOfLines={1}>
                  {opt.label}
                </Text>
                {active && (
                  <View style={s.activeIndicator}>
                    <MaterialCommunityIcons name="check" size={10} color={white} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
        <GridLine />

        {/* ── ACCOUNT ── */}
        <SectionBar label="ACCOUNT" bg={black} textColor={white} />
        <View style={s.row}>
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="account-circle-outline" size={18} color={blue} />
            <View>
              <Text style={s.rowText}>{user?.name ?? 'Outfit Oracle account'}</Text>
              <Text style={s.rowSub}>{user?.email ?? 'Local device account'}</Text>
            </View>
          </View>
        </View>
        <GridLine />
        <Pressable
          style={s.row}
          onPress={confirmSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="logout" size={18} color={red} />
            <Text style={s.rowText}>Sign out</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={black} />
        </Pressable>
        <GridLine />

        {/* ── PREFERENCES ── */}
        <SectionBar label="PREFERENCES" bg={blue} textColor={white} />

        <View style={s.prefLabel}>
          <Text style={s.prefLabelText}>TEMPERATURE UNIT</Text>
        </View>
        <View style={s.toggleRow}>
          {TEMP_OPTIONS.map((opt, i) => {
            const active = tempUnit === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[s.toggleChip, active && s.toggleChipActive, i === 0 && { borderRightWidth: gridLine }]}
                onPress={() => setTempUnit(opt.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={opt.label}
              >
                <Text style={[s.toggleChipText, active && s.toggleChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <GridLine />

        {/* ── DATA ── */}
        <SectionBar label="DATA" bg={yellow} textColor={black} />

        <Pressable
          style={s.row}
          onPress={clearHistory}
          accessibilityRole="button"
          accessibilityLabel="Clear outfit history"
        >
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="history" size={18} color={blue} />
            <View>
              <Text style={s.rowText}>Clear outfit history</Text>
              <Text style={s.rowSub}>Keeps streak and style profile</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={black} />
        </Pressable>
        <GridLine />

        <Pressable
          style={s.row}
          onPress={resetAll}
          accessibilityRole="button"
          accessibilityLabel="Reset all app data"
        >
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="delete-outline" size={18} color={red} />
            <View>
              <Text style={[s.rowText, { color: red }]}>Reset all data</Text>
              <Text style={s.rowSub}>Removes everything, including account</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={red} />
        </Pressable>
        <GridLine />

        {/* ── ANALYTICS ── */}
        <SectionBar label="ANALYTICS" bg={black} textColor={white} />
        <View style={s.row}>
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="chart-line" size={18} color={blue} />
            <View>
              <Text style={s.rowText}>Usage analytics</Text>
              <Text style={s.rowSub}>No personal data. Helps improve the Oracle.</Text>
            </View>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={updateAnalytics}
            trackColor={{ false: 'rgba(0,0,0,0.12)', true: blue }}
            thumbColor={white}
          />
        </View>
        <GridLine />

        {/* ── ABOUT ── */}
        <SectionBar label="ABOUT" bg={red} textColor={white} />

        <View style={s.row}>
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="information-outline" size={18} color={black} />
            <Text style={s.rowText}>Version</Text>
          </View>
          <Text style={s.rowValue}>{APP_VERSION}</Text>
        </View>
        <GridLine />

        <Pressable
          style={s.row}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          accessibilityRole="link"
          accessibilityLabel="Open privacy policy"
        >
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="shield-outline" size={18} color={black} />
            <Text style={s.rowText}>Privacy policy</Text>
          </View>
          <MaterialCommunityIcons name="open-in-new" size={16} color="rgba(0,0,0,0.35)" />
        </Pressable>
        <GridLine />

        <View style={s.row}>
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color={black} />
            <Text style={s.rowText}>Weather data</Text>
          </View>
          <Text style={s.rowValue}>Open-Meteo</Text>
        </View>
        <GridLine />

        <View style={s.row}>
          <View style={s.rowLeft}>
            <MaterialCommunityIcons name="brain" size={18} color={black} />
            <Text style={s.rowText}>AI model</Text>
          </View>
          <Text style={s.rowValue}>Claude Sonnet 4.6</Text>
        </View>
        <GridLine />

        <Text style={s.footer}>
          Powered by Anthropic Claude + Open-Meteo.{'\n'}No personal data stored on our servers.
        </Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: white,
  },
  header: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: HEADER_TOP,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  closeBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 14,
    letterSpacing: 4,
    color: black,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },

  /* Theme grid */
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themeChip: {
    width: '33.33%',
    borderRightWidth: gridLine,
    borderBottomWidth: gridLine,
    borderColor: black,
    padding: spacing.sm,
    minHeight: 72,
    justifyContent: 'space-between',
  },
  themeChipActive: {
    backgroundColor: black,
  },
  themeChipPalette: {
    flexDirection: 'row',
    height: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  paletteBlock: {
    flex: 1,
  },
  themeChipText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
    color: black,
  },
  themeChipTextActive: {
    color: white,
  },
  activeIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    backgroundColor: red,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Preferences */
  prefLabel: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  prefLabelText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.45)',
  },
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: gridLine,
    borderColor: black,
  },
  toggleChip: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderColor: black,
  },
  toggleChipActive: {
    backgroundColor: blue,
  },
  toggleChipText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    color: black,
    letterSpacing: 0.5,
  },
  toggleChipTextActive: {
    color: white,
  },

  /* Rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    minHeight: 60,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  rowText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
    color: black,
    letterSpacing: 0.2,
  },
  rowSub: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: 'rgba(0,0,0,0.45)',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  rowValue: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
    color: 'rgba(0,0,0,0.40)',
    letterSpacing: 0.3,
  },

  /* Footer */
  footer: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: 'rgba(0,0,0,0.30)',
    letterSpacing: 0.3,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
});
