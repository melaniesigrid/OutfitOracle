import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  RefreshControl,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_700Bold_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';

import * as Haptics from 'expo-haptics';
import { useOracle } from '../hooks/useOracle';
import { useRecentCities } from '../hooks/useRecentCities';
import { GenderToggle, Gender } from '../components/GenderToggle';
import { WeatherStrip } from '../components/WeatherStrip';
import { VerdictCard } from '../components/VerdictCard';
import { OutfitCard } from '../components/OutfitCard';
import { AvoidSection } from '../components/AvoidSection';
import { LoadingOracle } from '../components/LoadingOracle';
import { CitySuggestions } from '../components/CitySuggestions';
import { searchCities, CitySuggestion } from '../services/weather';
import { colors, fonts, spacing } from '../theme';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';

export function HomeScreen() {
  const [city, setCity]               = useState('');
  const [gender, setGender]           = useState<Gender>('Women');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { status, weather, verdict, error, consult, reset } = useOracle(CLAUDE_API_KEY);
  const { recents, addCity } = useRecentCities();

  const [fontsLoaded] = useFonts({
    CormorantGaramond_700Bold_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular_Italic,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  const scrollRef = useRef<ScrollView>(null);

  const isLoading = status === 'fetching-weather' || status === 'fetching-verdict';
  const showResult = status === 'done' && weather && verdict;

  useEffect(() => {
    if (status === 'done') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

  useEffect(() => {
    if (isLoading || city.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchCities(city);
      setSuggestions(results);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [city, isLoading]);

  const handleConsult = (overrideCity?: string) => {
    const target = (overrideCity ?? city).trim();
    if (!target || isLoading) return;
    setSuggestions([]);
    setCity(target);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCity(target);
    consult(target, gender);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 360, animated: true }), 400);
  };


  if (!fontsLoaded) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            showResult ? (
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => handleConsult(city)}
                tintColor={colors.textMuted}
              />
            ) : undefined
          }
        >

          {/* ── EDITORIAL MASTHEAD ── */}
          <View style={styles.masthead}>
            <Text style={styles.mastheadKicker}>— WEATHER-POWERED STYLE —</Text>
            <Text style={styles.mastheadTitle1}>OUTFIT</Text>
            <Text style={styles.mastheadTitle2}>Oracle</Text>
            <View style={styles.mastheadRule} />
            <Text style={styles.mastheadTagline}>Your unsolicited style authority</Text>
          </View>

          {/* ── BODY ── */}
          <View style={styles.body}>

            {/* Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>YOUR CITY</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={text => { setCity(text); if (!text.trim()) setSuggestions([]); }}
                placeholder="Toronto, London, Tokyo…"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => handleConsult()}
                editable={!isLoading}
              />
              <View style={styles.inputRule} />
            </View>

            {/* City autocomplete */}
            <CitySuggestions
              suggestions={suggestions}
              onSelect={(name) => handleConsult(name)}
            />

            {/* Recent cities */}
            {recents.length > 0 && (
              <View style={styles.recentsRow}>
                <Text style={styles.recentsLabel}>RECENT</Text>
                <View style={styles.recentChips}>
                  {recents.map(c => (
                    <Pressable
                      key={c}
                      style={({ pressed }) => [styles.recentChip, pressed && styles.recentChipPressed]}
                      onPress={() => handleConsult(c)}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${c} again`}
                    >
                      <Text style={styles.recentChipText}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Gender */}
            <GenderToggle selected={gender} onChange={setGender} />

            {/* CTA */}
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                pressed && styles.btnPressed,
                isLoading && styles.btnDisabled,
              ]}
              onPress={() => handleConsult()}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Consult the Oracle"
              accessibilityHint="Fetches weather and generates an outfit recommendation for your city"
              accessibilityState={{ disabled: isLoading }}
            >
              <Text style={styles.btnText}>
                {isLoading ? 'Consulting…' : 'Consult the Oracle'}
              </Text>
              {!isLoading && <Text style={styles.btnArrow}>→</Text>}
            </Pressable>

            {/* Error */}
            {status === 'error' && error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorLabel}>THE ORACLE ENCOUNTERED AN ISSUE</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable
                  onPress={reset}
                  accessibilityRole="button"
                  accessibilityLabel="Try again"
                >
                  <Text style={styles.retryText}>Try Again →</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Loading */}
            <LoadingOracle status={status} />

            {/* Results */}
            {showResult ? (
              <View style={styles.results}>
                <WeatherStrip weather={weather} />
                <VerdictCard verdict={verdict} />
                {verdict.outfits.map((item, i) => (
                  <OutfitCard key={item.category} item={item} index={i} />
                ))}
                <AvoidSection items={verdict.avoid} />
                <Pressable
                  style={styles.resetBtn}
                  onPress={() => { reset(); setCity(''); }}
                  accessibilityRole="button"
                  accessibilityLabel="Ask again"
                  accessibilityHint="Clears the current result and returns to the search"
                >
                  <Text style={styles.resetText}>Ask Again →</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerRule} />
              <Text style={styles.footerTitle}>Outfit Oracle</Text>
              <Text style={styles.footerNote}>
                Weather via Open-Meteo · AI via Claude{'\n'}
                Style opinions not liable for social consequences
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  content: {
    paddingBottom: 60,
  },

  /* Masthead */
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
  mastheadTagline: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(250,249,246,0.35)',
    textAlign: 'right',
  },

  /* Body */
  body: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  /* Input */
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  input: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    letterSpacing: -0.5,
  },
  inputRule: {
    height: 1,
    backgroundColor: colors.borderHard,
    marginTop: 4,
  },

  /* Recent cities */
  recentsRow: {
    marginBottom: spacing.lg,
  },
  recentsLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recentChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentChipPressed: {
    backgroundColor: colors.bgSurface,
  },
  recentChipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  /* Button */
  btn: {
    backgroundColor: colors.bgDark,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: '#FAF9F6',
    letterSpacing: 0.3,
  },
  btnArrow: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: 'rgba(250,249,246,0.55)',
  },

  /* Error */
  errorBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.scarlet,
    paddingLeft: spacing.md,
    marginBottom: spacing.lg,
  },
  errorLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.scarlet,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  retryText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.scarlet,
    letterSpacing: 0.5,
  },

  /* Results */
  results: {
    marginTop: spacing.sm,
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  resetText: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  /* Footer */
  footer: {
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerRule: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginBottom: spacing.md,
  },
  footerTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textMuted,
  },
  footerNote: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
});
