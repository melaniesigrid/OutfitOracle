import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, RefreshControl,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
  Dimensions, Share, Animated, Easing, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useAppData } from '../contexts/AppContext';
import { useRecentCities } from '../hooks/useRecentCities';
import { GenderToggle, Gender } from '../components/GenderToggle';
import { OccasionPicker, Occasion } from '../components/OccasionPicker';
import { WeatherStrip } from '../components/WeatherStrip';
import { VerdictCard } from '../components/VerdictCard';
import { OutfitCard } from '../components/OutfitCard';
import { AvoidSection } from '../components/AvoidSection';
import { LoadingOracle } from '../components/LoadingOracle';
import { CitySuggestions } from '../components/CitySuggestions';
import { ShareCard } from '../components/ShareCard';
import { SkeletonResults } from '../components/SkeletonResults';
import { ChallengeCard } from '../components/ChallengeCard';
import { useWeeklyChallenge } from '../hooks/useWeeklyChallenge';
import { searchCities, CitySuggestion } from '../services/weather';
import {
  trackShareTapped, trackRecentCityTapped, trackAutocompleteCitySelected,
} from '../services/analytics';
import { AppColors, AppFonts, ThemeName, isEditorialTheme, isY2KTheme, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { Y2KOracleScreen } from './y2k/Y2KOracleScreen';

export function OracleScreen() {
  const { themeName } = useTheme();
  if (isY2KTheme(themeName)) return <Y2KOracleScreen />;
  return <EditorialOracleScreen />;
}

function EditorialOracleScreen() {
  const { colors, fonts, isDark, themeName } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts, themeName), [colors, fonts, themeName]);
  const { oracle, profileCtx, historyCtx, streakCtx, savedCtx } = useAppData();
  const { status, weather, verdict, error, consult, consultByCoords, reset, cachedCity, cachedAt, isFromCache, isOffline } = oracle;
  const profile = profileCtx.profile;

  const [city, setCity]               = useState('');
  const [gender, setGender]           = useState<Gender>('Women');
  const [occasion, setOccasion]       = useState<Occasion>('Any');
  const [lookMode, setLookMode]       = useState<'polished' | 'casual'>('polished');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const debounceRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressSuggestRef = useRef(false);
  const scrollRef          = useRef<ScrollView>(null);
  const shareCardRef       = useRef<View>(null);
  const btnScale           = useRef(new Animated.Value(1)).current;
  const resultTranslateX   = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const toggleFade         = useRef(new Animated.Value(1)).current;
  const isFirstToggle      = useRef(true);
  const magicOpacity       = useRef(new Animated.Value(0)).current;

  const [showMagicMoment, setShowMagicMoment] = useState(false);

  const dismissMagicMoment = React.useCallback(() => {
    Animated.timing(magicOpacity, { toValue: 0, duration: 500, easing: Easing.in(Easing.ease), useNativeDriver: true })
      .start(() => setShowMagicMoment(false));
  }, []);

  const triggerMagicMoment = React.useCallback(() => {
    magicOpacity.setValue(0);
    setShowMagicMoment(true);
    Animated.timing(magicOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true })
      .start(() => { setTimeout(dismissMagicMoment, 2800); });
  }, [dismissMagicMoment]);

  const isLoading = status === 'fetching-weather' || status === 'fetching-verdict';
  const showResult = status === 'done' && !!weather && !!verdict;

  const { recents, addCity } = useRecentCities();
  const weeklyChallenge = useWeeklyChallenge(historyCtx.history);

  // Saved looks that match current weather (same city, temp within 5°C)
  const wearAgainMatches = showResult && weather
    ? savedCtx.saved.filter(s =>
        s.city.toLowerCase() === city.toLowerCase() &&
        s.weather != null &&
        Math.abs(s.weather.temp - weather.temp) <= 5,
      )
    : [];

  // Pre-fill city from cache
  useEffect(() => {
    if (cachedCity && !city) setCity(cachedCity);
  }, [cachedCity]);

  // Haptic on fresh result
  useEffect(() => {
    if (status === 'done' && !isFromCache) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

  // Record consult in history + streak; persist founding member badge to dedicated key
  useEffect(() => {
    if (status === 'done' && !isFromCache && weather && verdict) {
      // First-consult magic moment — one-time only, fires before addEntry so history is still empty
      if (historyCtx.history.length === 0) {
        AsyncStorage.getItem('@outfit_oracle_magic_shown')
          .then(val => { if (!val) { AsyncStorage.setItem('@outfit_oracle_magic_shown', '1').catch(() => {}); triggerMagicMoment(); } })
          .catch(() => {});
      }
      historyCtx.addEntry(city, gender, weather, verdict, occasion);
      streakCtx.recordConsult();
      if (verdict.foundingMember) {
        AsyncStorage.setItem('@outfit_oracle_founding_member', '1').catch(() => {});
      }
    }
  }, [status, isFromCache]);

  // Verdict arrival: horizontal wipe from right edge, 600ms ease-in-out per motion spec
  useEffect(() => {
    if (status === 'done') {
      resultTranslateX.setValue(Dimensions.get('window').width);
      Animated.timing(resultTranslateX, {
        toValue: 0,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  // POLISHED/CASUAL toggle crossfade — skip on initial render, fade in on mode switch
  useEffect(() => {
    if (isFirstToggle.current) { isFirstToggle.current = false; return; }
    toggleFade.setValue(0);
    Animated.timing(toggleFade, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [lookMode]);

  // City autocomplete debounce
  useEffect(() => {
    if (isLoading || city.trim().length < 2 || suppressSuggestRef.current) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (suppressSuggestRef.current) return;
      const results = await searchCities(city);
      setSuggestions(results);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [city, isLoading]);

  const handleConsult = (overrideCity?: string) => {
    const target = (overrideCity ?? city).trim();
    if (!target || isLoading) return;
    suppressSuggestRef.current = true;
    setSuggestions([]);
    setCity(target);
    setLookMode('polished');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCity(target);
    consult(target, gender, profile, occasion);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 240, animated: true }), 400);
  };

  const handleUseLocation = async () => {
    if (locationLoading || isLoading) return;
    setLocationLoading(true);
    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const results = await Location.reverseGeocodeAsync(loc.coords);
      if (!results.length) return;
      const place = results[0];
      const detectedCity    = place.city ?? place.subregion ?? place.region ?? '';
      const detectedCountry = place.isoCountryCode ?? place.country ?? '';
      if (!detectedCity) return;
      suppressSuggestRef.current = true;
      setSuggestions([]);
      setCity(detectedCity);
      addCity(detectedCity);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      consultByCoords(loc.coords.latitude, loc.coords.longitude, detectedCity, detectedCountry, gender, profile, occasion);
      setTimeout(() => scrollRef.current?.scrollTo({ y: 240, animated: true }), 400);
    } catch {
      // GPS unavailable — silent fallback
    } finally {
      setLocationLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareCardRef.current || !verdict) return;
    trackShareTapped(city, verdict.vibe);
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      await Share.share({ url: uri });
    } catch { /* cancelled */ }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            showResult ? (
              <RefreshControl refreshing={isLoading} onRefresh={() => handleConsult(city)} tintColor={colors.textMuted} />
            ) : undefined
          }
        >

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View style={styles.headerTop} />
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>OUTFIT ORACLE</Text>
              <Text style={styles.headerDate}>
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
              </Text>
            </View>
            <View style={styles.headerBottom} />
          </View>

          {/* ── INPUT ── */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>YOUR CITY</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={text => {
                suppressSuggestRef.current = false;
                setCity(text);
                if (!text.trim()) setSuggestions([]);
              }}
              placeholder="Toronto, London, Tokyo…"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => handleConsult()}
              editable={!isLoading}
            />
            <View style={styles.inputRule} />
            <Pressable
              style={styles.locationBtn}
              onPress={handleUseLocation}
              disabled={isLoading || locationLoading}
              accessibilityRole="button"
              accessibilityLabel="Use my current location"
            >
              <Text style={styles.locationBtnText}>
                {locationLoading ? 'Detecting location…' : '+ Use my location'}
              </Text>
            </Pressable>
          </View>

          <CitySuggestions
            suggestions={suggestions}
            onSelect={name => { trackAutocompleteCitySelected(name); handleConsult(name); }}
          />

          {recents.length > 0 && (
            <View style={styles.recentsRow}>
              <Text style={styles.recentsLabel}>RECENT</Text>
              <View style={styles.recentChips}>
                {recents.map(c => (
                  <Pressable
                    key={c}
                    style={({ pressed }) => [styles.recentChip, pressed && styles.recentChipPressed]}
                    onPress={() => { trackRecentCityTapped(c); handleConsult(c); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Search ${c} again`}
                  >
                    <Text style={styles.recentChipText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <GenderToggle selected={gender} onChange={setGender} />
          <OccasionPicker selected={occasion} onChange={setOccasion} />
          <ChallengeCard state={weeklyChallenge} />

          {/* ── CTA ── */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed, isLoading && styles.btnDisabled]}
              onPress={() => handleConsult()}
              onPressIn={() => Animated.timing(btnScale, { toValue: 0.97, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()}
              onPressOut={() => Animated.timing(btnScale, { toValue: 1, duration: 150, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Consult the Oracle"
            >
              <Text style={styles.btnText}>{isLoading ? 'Consulting…' : 'Consult the Oracle'}</Text>
              {!isLoading && <Text style={styles.btnArrow}>→</Text>}
            </Pressable>
          </Animated.View>

          {/* ── ERROR ── */}
          {status === 'error' && error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorLabel}>THE ORACLE ENCOUNTERED AN ISSUE</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={reset} accessibilityRole="button" accessibilityLabel="Try again">
                <Text style={styles.retryText}>Try Again →</Text>
              </Pressable>
            </View>
          ) : null}

          {/* ── LOADING ── */}
          <LoadingOracle status={status} />
          {isLoading && <SkeletonResults />}

          {/* ── RESULTS ── */}
          {showResult ? (
            <Animated.View style={[styles.results, { transform: [{ translateX: resultTranslateX }] }]}>
              {isFromCache && cachedAt ? (
                <View style={styles.cacheBadge}>
                  <Text style={styles.cacheBadgeText}>
                    {isOffline
                      ? `OFFLINE — CACHED · ${new Date(cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : `LAST CONSULTED · ${new Date(cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </Text>
                  {!isOffline && (
                    <Pressable onPress={() => handleConsult(city)} accessibilityRole="button" accessibilityLabel="Refresh result">
                      <Text style={styles.cacheRefresh}>↻ Refresh</Text>
                    </Pressable>
                  )}
                </View>
              ) : null}
              {wearAgainMatches.length > 0 && (
                <View style={styles.wearAgainBanner}>
                  <Text style={styles.wearAgainLabel}>WEAR THIS AGAIN</Text>
                  <Text style={styles.wearAgainText}>
                    {wearAgainMatches.length === 1
                      ? `You saved a look for ${city} in similar conditions. The Oracle approves a repeat.`
                      : `You have ${wearAgainMatches.length} saved looks for ${city} in similar conditions.`}
                  </Text>
                </View>
              )}
              <WeatherStrip weather={weather} />
              <VerdictCard verdict={verdict} />
              {verdict.outfitsAlt && (
                <View style={styles.lookToggle}>
                  {([['polished', 'DAY'], ['casual', 'NIGHT']] as const).map(([mode, label]) => (
                    <Pressable
                      key={mode}
                      style={[styles.lookToggleBtn, lookMode === mode && styles.lookToggleBtnActive]}
                      onPress={() => { Haptics.selectionAsync(); setLookMode(mode); }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: lookMode === mode }}
                      accessibilityLabel={`${label} look`}
                    >
                      <Text style={[styles.lookToggleText, lookMode === mode && styles.lookToggleTextActive]}>
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <Animated.View style={{ opacity: toggleFade }}>
                {(lookMode === 'casual' && verdict.outfitsAlt ? verdict.outfitsAlt : verdict.outfits).map((item, i) => (
                  <OutfitCard
                    key={item.category}
                    item={item}
                    index={i}
                    city={city}
                    vibe={verdict.vibe}
                    weather={weather ? { temp: weather.temp, conditionLabel: weather.conditionLabel } : undefined}
                  />
                ))}
                <AvoidSection items={verdict.avoid} />
              </Animated.View>
              <Pressable
                style={styles.shareBtn}
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel="Share the Oracle's verdict"
              >
                <Text style={styles.shareBtnText}>SHARE THE LOOK →</Text>
              </Pressable>
              <Pressable
                style={styles.resetBtn}
                onPress={() => { suppressSuggestRef.current = false; reset(); setCity(''); }}
                accessibilityRole="button"
                accessibilityLabel="Ask again"
              >
                <Text style={styles.resetText}>Ask Again →</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {/* Off-screen share card */}
          {showResult ? (
            <View style={{ position: 'absolute', left: Dimensions.get('window').width + 10, top: 0 }}>
              <ShareCard ref={shareCardRef} weather={weather} verdict={verdict} occasion={occasion} />
            </View>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── FIRST-CONSULT MAGIC MOMENT ── */}
      {showMagicMoment && verdict && (
        <Animated.View style={[styles.magicOverlay, { opacity: magicOpacity }]} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={dismissMagicMoment} accessibilityRole="button" accessibilityLabel="Continue">
            <View style={styles.magicContent}>
              <Image source={require('../logo-dark.png')} style={styles.magicLogo} resizeMode="contain" />
              <Text style={styles.magicCity}>{city}</Text>
              <Text style={styles.magicVibe}>{verdict.vibe.toUpperCase()}</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts, themeName: ThemeName) {
  const isElectric = themeName === 'electric';
  const isEditorial = isEditorialTheme(themeName);
  // Electric CTA: hot-pink button on cobalt — the one scarlet moment on the input screen
  const btnBg       = isElectric ? colors.scarlet : colors.bgDark;
  const btnTextColor = '#FAF9F6';
  const btnArrowColor = 'rgba(250,249,246,0.55)';

  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: 60 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTop: {
    height: 1,
    backgroundColor: colors.borderHard,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 3,
    color: colors.textPrimary,
  },
  headerDate: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  headerBottom: {
    height: 1,
    backgroundColor: colors.border,
  },
  inputSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  inputLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2.5, color: colors.textMuted, marginBottom: spacing.sm },
  input: { fontFamily: fonts.display, fontSize: 30, color: colors.textPrimary, paddingVertical: spacing.sm, letterSpacing: -0.5 },
  inputRule: { height: 1, backgroundColor: colors.borderHard, marginTop: 4 },
  locationBtn: { paddingVertical: spacing.sm, marginTop: spacing.xs, alignSelf: 'flex-start' },
  locationBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.textMuted },
  recentsRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  recentsLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2.5, color: colors.textMuted, marginBottom: spacing.sm },
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  recentChip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderWidth: 1, borderColor: colors.border },
  recentChipPressed: { backgroundColor: colors.bgSurface },
  recentChipText: { fontFamily: fonts.mono, fontSize: 11, color: colors.textSecondary, letterSpacing: 0.3 },
  btn: {
    backgroundColor: btnBg, paddingVertical: 18, paddingHorizontal: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
  },
  btnPressed: { opacity: 0.75 },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontFamily: fonts.display, fontSize: 22, color: btnTextColor, letterSpacing: -0.3 },
  btnArrow: { fontFamily: fonts.mono, fontSize: 14, color: btnArrowColor },
  errorBox: {
    borderLeftWidth: 2, borderLeftColor: colors.scarlet,
    paddingLeft: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  errorLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.scarlet, marginBottom: spacing.sm },
  errorText: { fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing.md },
  retryText: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.scarlet, letterSpacing: 0.5 },
  results: { marginTop: spacing.sm, paddingHorizontal: spacing.lg },
  lookToggle: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lookToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  lookToggleBtnActive: {
    backgroundColor: colors.bgDark,
  },
  lookToggleText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  lookToggleTextActive: {
    color: '#FAF9F6',
  },
  cacheBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgSurface, marginBottom: spacing.md,
  },
  cacheBadgeText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.5, color: colors.textMuted },
  cacheRefresh: { fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary, letterSpacing: 0.5 },
  shareBtn: {
    alignSelf: 'stretch', paddingVertical: 14, borderWidth: 1, borderColor: colors.borderHard,
    alignItems: 'center', marginBottom: spacing.md,
  },
  shareBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2.5, color: colors.textPrimary },
  resetBtn: { alignSelf: 'center', paddingVertical: spacing.md, marginBottom: spacing.lg },
  resetText: { fontFamily: fonts.serif, fontSize: 18, color: colors.textSecondary, letterSpacing: 0.3 },
  wearAgainBanner: {
    borderLeftWidth: 2,
    borderLeftColor: colors.scarlet,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.scarletDim,
  },
  wearAgainLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.scarlet,
    marginBottom: 4,
  },
  wearAgainText: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    fontStyle: 'italic',
  },

  /* First-consult magic moment overlay */
  magicOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0D0B08',
    zIndex: 100,
  },
  magicContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  magicLogo: {
    width: '72%',
    height: 100,
    marginBottom: spacing.xxl,
  },
  magicCity: {
    fontFamily: fonts.displayLight,
    fontSize: 48,
    color: '#FAF9F6',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  magicVibe: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: 'rgba(250,249,246,0.40)',
    letterSpacing: 3,
    textAlign: 'center',
  },
}); }
