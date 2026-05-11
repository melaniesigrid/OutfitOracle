import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Platform, StatusBar, Alert, Linking, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppData } from '../contexts/AppContext';
import { colors, fonts, spacing } from '../theme';

const ALL_KEYS = [
  '@outfit_oracle_history',
  '@outfit_oracle_first_consult',
  '@outfit_oracle_recent_cities',
  '@outfit_oracle_last_result',
  '@outfit_oracle_streak',
  '@outfit_oracle_style_profile',
  '@onboarding_complete',
];

const SOFT_KEYS = [
  '@outfit_oracle_history',
  '@outfit_oracle_first_consult',
  '@outfit_oracle_recent_cities',
  '@outfit_oracle_last_result',
];

const APP_VERSION = '1.0.0';
const PRIVACY_POLICY_URL = 'https://github.com/melaniesigridab/outfit-oracle'; // replace with hosted URL

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { historyCtx } = useAppData();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

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
            await AsyncStorage.multiRemove(SOFT_KEYS);
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
            await AsyncStorage.multiRemove(ALL_KEYS);
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
              <MaterialCommunityIcons name="history" size={16} color="rgba(250,249,246,0.55)" />
              <Text style={styles.rowText}>Clear outfit history</Text>
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
              <Text style={[styles.rowText, styles.rowTextDanger]}>Reset all data</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(196,18,48,0.40)" />
          </Pressable>
        </View>

        {/* ── ANALYTICS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ANALYTICS</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="chart-line" size={16} color="rgba(250,249,246,0.55)" />
              <View>
                <Text style={styles.rowText}>Usage analytics</Text>
                <Text style={styles.rowSub}>Helps improve the Oracle. No personal data.</Text>
              </View>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={setAnalyticsEnabled}
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
              <MaterialCommunityIcons name="information-outline" size={16} color="rgba(250,249,246,0.55)" />
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
              <MaterialCommunityIcons name="shield-outline" size={16} color="rgba(250,249,246,0.55)" />
              <Text style={styles.rowText}>Privacy policy</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={14} color="rgba(250,249,246,0.25)" />
          </Pressable>

          <View style={styles.rowDivider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={16} color="rgba(250,249,246,0.55)" />
              <Text style={styles.rowText}>Weather data</Text>
            </View>
            <Text style={styles.rowValue}>Open-Meteo</Text>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="brain" size={16} color="rgba(250,249,246,0.55)" />
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

const styles = StyleSheet.create({
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
    borderBottomColor: 'rgba(250,249,246,0.08)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 3,
    color: 'rgba(250,249,246,0.60)',
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
    borderColor: 'rgba(250,249,246,0.09)',
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2.5,
    color: 'rgba(250,249,246,0.30)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(250,249,246,0.06)',
  },

  /* Rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 52,
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
    color: 'rgba(250,249,246,0.80)',
    letterSpacing: 0.3,
  },
  rowTextDanger: {
    color: colors.scarlet,
  },
  rowSub: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.30)',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  rowValue: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.35)',
    letterSpacing: 0.5,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(250,249,246,0.06)',
    marginHorizontal: spacing.md,
  },

  /* Footer */
  footer: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.20)',
    letterSpacing: 0.3,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
});
