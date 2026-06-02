import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, RefreshControl,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
  Dimensions, Animated, Easing, Image, Share,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useAppData } from '../../contexts/AppContext';
import { useRecentCities } from '../../hooks/useRecentCities';
import { useMagicMoment } from '../../hooks/useMagicMoment';
import { GenderToggle, Gender } from '../../components/GenderToggle';
import { OccasionPicker, Occasion } from '../../components/OccasionPicker';
import { CitySuggestions } from '../../components/CitySuggestions';
import { LoadingOracle } from '../../components/LoadingOracle';
import { SkeletonResults } from '../../components/SkeletonResults';
import { ShareCard } from '../../components/ShareCard';
import { DressingLogicCard } from '../../components/DressingLogicCard';
import { searchCities, CitySuggestion } from '../../services/weather';
import {
  trackShareTapped, trackRecentCityTapped, trackAutocompleteCitySelected,
} from '../../services/analytics';
import { hasNightOutfit, selectOutfitsForLook } from '../../utils/outfitSelection';
import { formatLocationTimeWithCue } from '../../utils/locationTime';
import { y2kTokens, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { getY2KTypography } from '../../theme/y2kTypography';
import { Y2KWeatherCard } from '../../components/y2k/Y2KWeatherCard';
import { Y2KDecreeCard } from '../../components/y2k/Y2KDecreeCard';
import { Y2KOutfitCard } from '../../components/y2k/Y2KOutfitCard';
import { Y2KAvoidSection } from '../../components/y2k/Y2KAvoidSection';
import { Y2KBadge } from '../../components/y2k/Y2KBadge';
import { Y2KSticker } from '../../components/y2k/Y2KSticker';
import { useTempUnit } from '../../contexts/TemperatureContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Y2KOracleScreen() {
  const { y2kFontSubtheme } = useTheme();
  const insets = useSafeAreaInsets();
  const typo = useMemo(() => getY2KTypography(y2kFontSubtheme), [y2kFontSubtheme]);
  const { formatTemp } = useTempUnit();
  const { magicOpacity, showMagicMoment, dismissMagicMoment, tryTriggerFirstConsult } = useMagicMoment();

  const { oracle, profileCtx, historyCtx, streakCtx, dataResetEpoch } = useAppData();
  const {
    status, weather, verdict, error, consult, consultByCoords,
    reset, cachedCity, cachedAt, isFromCache, isOffline,
  } = oracle;
  const profile = profileCtx.profile;

  const [city, setCity]               = useState('');
  const [gender, setGender]           = useState<Gender>('Women');
  const [occasion, setOccasion]       = useState<Occasion>('Any');
  const [lookMode, setLookMode]       = useState<'polished' | 'casual'>('polished');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [suggestionsArmed, setSuggestionsArmed] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const debounceRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressSuggestRef = useRef(false);
  const searchSeqRef       = useRef(0);
  const scrollRef          = useRef<ScrollView>(null);
  const shareCardRef       = useRef<View>(null);
  const btnScale           = useRef(new Animated.Value(1)).current;
  const resultTranslateX   = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const toggleFade         = useRef(new Animated.Value(1)).current;
  const isFirstToggle      = useRef(true);
  const autoLocationStartedRef = useRef(false);

  const isLoading  = status === 'fetching-weather' || status === 'fetching-verdict';
  const showResult = status === 'done' && !!weather && !!verdict;
  const hasNightLook = hasNightOutfit(verdict);
  const currentOutfits = selectOutfitsForLook(verdict, lookMode);
  const cachedAtLabel = formatLocationTimeWithCue(cachedAt, weather?.utcOffsetSeconds);

  const { recents, addCity, removeCity } = useRecentCities();

  // Pre-fill from cache
  useEffect(() => {
    if (cachedCity && !city) {
      suppressSuggestRef.current = true;
      setSuggestionsArmed(false);
      setSuggestions([]);
      setCity(cachedCity);
    }
  }, [cachedCity]);

  // Haptic on result
  useEffect(() => {
    if (status === 'done' && !isFromCache) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

  // Record history + first-consult magic moment
  useEffect(() => {
    if (status === 'done' && !isFromCache && weather && verdict) {
      tryTriggerFirstConsult(historyCtx.history.length);
      historyCtx.addEntry(city, gender, weather, verdict, occasion);
      streakCtx.recordConsult();
    }
  }, [status, isFromCache]);

  // Result wipe-in
  useEffect(() => {
    if (status === 'done') {
      isFirstToggle.current = true;
      toggleFade.stopAnimation();
      toggleFade.setValue(1);
      setLookMode('polished');
      resultTranslateX.setValue(Dimensions.get('window').width);
      Animated.timing(resultTranslateX, {
        toValue: 0, duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [status, verdict?.vibe, weather?.city]);

  // Toggle crossfade
  useEffect(() => {
    if (isFirstToggle.current) { isFirstToggle.current = false; return; }
    toggleFade.setValue(0);
    Animated.timing(toggleFade, {
      toValue: 1, duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [lookMode]);

  // Autocomplete debounce
  useEffect(() => {
    const seq = ++searchSeqRef.current;
    if (!suggestionsArmed || isLoading || city.trim().length < 2 || suppressSuggestRef.current) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!suggestionsArmed || suppressSuggestRef.current) return;
      const results = await searchCities(city);
      if (searchSeqRef.current === seq && suggestionsArmed && !suppressSuggestRef.current) {
        setSuggestions(results);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [city, isLoading, suggestionsArmed]);

  const handleConsult = (overrideCity?: string) => {
    const target = (overrideCity ?? city).trim();
    if (!target || isLoading) return;
    suppressSuggestRef.current = true;
    setSuggestionsArmed(false);
    setSuggestions([]);
    setCity(target);
    setLookMode('polished');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCity(target);
    consult(target, gender, profile, occasion);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 280, animated: true }), 400);
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
      setSuggestionsArmed(false);
      setSuggestions([]);
      setCity(detectedCity);
      addCity(detectedCity);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      consultByCoords(
        loc.coords.latitude, loc.coords.longitude,
        detectedCity, detectedCountry, gender, profile, occasion,
      );
      setTimeout(() => scrollRef.current?.scrollTo({ y: 280, animated: true }), 400);
    } catch { /* GPS silent fallback */ }
    finally { setLocationLoading(false); }
  };

  useEffect(() => {
    autoLocationStartedRef.current = false;
  }, [dataResetEpoch]);

  useEffect(() => {
    if (autoLocationStartedRef.current || profileCtx.profileState.status !== 'set') return;
    autoLocationStartedRef.current = true;
    handleUseLocation();
  }, [dataResetEpoch, profileCtx.profileState.status]);

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
      <StatusBar barStyle="dark-content" backgroundColor={y2kTokens.lavenderBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
                tintColor={y2kTokens.hotPink}
              />
            ) : undefined
          }
        >
          {/* ── Y2K HEADER ── */}
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <View style={[styles.headerTopRule, { backgroundColor: y2kTokens.hotPink }]} />
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { fontFamily: typo.displayLarge.fontFamily, letterSpacing: typo.displayLarge.letterSpacing }]}>
                the oracle.
              </Text>
              <View style={styles.headerStickers}>
                <Y2KSticker type="sparkle" size={16} color={y2kTokens.hotPink} />
                <Y2KSticker type="filledHeart" size={16} color={y2kTokens.hotPink} />
              </View>
            </View>
            <View style={styles.headerSubRow}>
              <Text style={[styles.headerSub, { fontFamily: typo.monoLabel.fontFamily }]}>// submit the brief ♡</Text>
              <Text style={[styles.headerDate, { fontFamily: typo.monoData.fontFamily }]}>
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}
              </Text>
            </View>
            <View style={styles.headerBottomRule} />
          </View>

          {/* ── INPUT PANEL ── */}
          <View style={styles.inputPanel}>
            {/* Double-border card for input area */}
            <View style={styles.inputCard}>
              <View style={styles.inputCardInner}>

                <Text style={[styles.inputQ, { fontFamily: typo.monoLabel.fontFamily }]}>where are we judging?</Text>
                <TextInput
                  style={[styles.input, { fontFamily: typo.displaySmall.fontFamily }]}
                  value={city}
                  onChangeText={text => {
                    suppressSuggestRef.current = false;
                    setSuggestionsArmed(true);
                    setCity(text);
                    if (!text.trim()) setSuggestions([]);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setSuggestionsArmed(false);
                      setSuggestions([]);
                    }, 120);
                  }}
                  placeholder="Toronto, London, Tokyo…"
                  placeholderTextColor={y2kTokens.mutedPurple + '88'}
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
                  <Text style={[styles.locationBtnText, { fontFamily: typo.monoData.fontFamily }]}>
                    {locationLoading ? '✦ detecting…' : '+ use my location ♡'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <CitySuggestions
            suggestions={suggestions}
            onSelect={name => { trackAutocompleteCitySelected(name); handleConsult(name); }}
          />

          {/* Gender + Occasion — these use theme colors automatically */}
          <GenderToggle selected={gender} onChange={setGender} />
          <OccasionPicker selected={occasion} onChange={setOccasion} />
          {/* Recent cities */}
          {recents.length > 0 && (
            <View style={styles.recentsRow}>
              <Text style={styles.recentsLabel}>// RECENT CITIES</Text>
              <View style={styles.recentChips}>
                {recents.map(c => (
                  <View key={c} style={styles.recentChip}>
                    <Pressable
                      style={({ pressed }) => [styles.recentCityButton, pressed && styles.recentChipPressed]}
                      onPress={() => { trackRecentCityTapped(c); handleConsult(c); }}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${c} again`}
                    >
                      <Text style={styles.recentChipText} numberOfLines={1}>{c} ♡</Text>
                    </Pressable>
                    <Pressable
                      style={styles.recentRemove}
                      onPress={() => { Haptics.selectionAsync(); removeCity(c); }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${c} from recent cities`}
                    >
                      <Text style={styles.recentRemoveText}>x</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── CTA ── */}
          <Animated.View style={{ transform: [{ scale: btnScale }], marginHorizontal: spacing.lg, marginBottom: spacing.xl }}>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed, isLoading && styles.ctaBtnDisabled]}
              onPress={() => handleConsult()}
              onPressIn={() => Animated.timing(btnScale, { toValue: 0.97, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()}
              onPressOut={() => Animated.timing(btnScale, { toValue: 1, duration: 150, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Consult the Oracle"
            >
              <Text style={[styles.ctaText, { fontFamily: typo.displaySmall.fontFamily }]}>
                {isLoading ? 'checking humidity, morality…' : 'CONSULT THE ORACLE ♡'}
              </Text>
              {!isLoading && <Y2KSticker type="sparkle" size={14} color={y2kTokens.cream} />}
            </Pressable>
          </Animated.View>

          {/* ── ERROR ── */}
          {status === 'error' && error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorLabel}>✕ THE ORACLE IS DISPLEASED</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={reset} accessibilityRole="button" accessibilityLabel="Try again">
                <Text style={[styles.retryText, { fontFamily: typo.scriptMedium.fontFamily }]}>try again ♡</Text>
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
                      ? `✕ OFFLINE — CACHED · ${cachedAtLabel}`
                      : `// LAST CONSULTED · ${cachedAtLabel}`}
                  </Text>
                  {!isOffline && (
                    <Pressable onPress={() => handleConsult(city)} accessibilityRole="button" accessibilityLabel="Refresh result">
                      <Text style={styles.cacheRefresh}>↻ refresh</Text>
                    </Pressable>
                  )}
                </View>
              ) : null}

              <Y2KWeatherCard weather={weather} formatTemp={formatTemp} />
              <DressingLogicCard weather={weather} formatTemp={formatTemp} style={styles.logicCard} />
              <Y2KDecreeCard verdict={verdict} />

              {/* Day / Night toggle */}
              {hasNightLook && (
                <View style={styles.lookToggle}>
                  {([['polished', 'DAY LOOK'], ['casual', 'NIGHT LOOK']] as const).map(([mode, label]) => (
                    <Pressable
                      key={mode}
                      style={[styles.lookToggleBtn, lookMode === mode && styles.lookToggleBtnActive]}
                      onPress={() => { Haptics.selectionAsync(); setLookMode(mode); }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: lookMode === mode }}
                      accessibilityLabel={`${label}`}
                    >
                      <Text style={[styles.lookToggleText, lookMode === mode && styles.lookToggleTextActive]}>
                        {label} {lookMode === mode ? '♡' : ''}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Outfit cards */}
              <Animated.View style={{ opacity: toggleFade }}>
                {currentOutfits.map((item, i) => (
                  <Y2KOutfitCard
                    key={`${lookMode}-${item.category}-${i}`}
                    item={item}
                    index={i}
                    city={city}
                    vibe={verdict.vibe}
                    weather={weather ? { temp: weather.temp, conditionLabel: weather.conditionLabel } : undefined}
                  />
                ))}
                <Y2KAvoidSection items={verdict.avoid} />
              </Animated.View>

              {/* Bottom actions */}
              <Pressable
                onPress={handleShare}
                style={styles.shareBtn}
                accessibilityRole="button"
                accessibilityLabel="Share the Oracle's verdict"
              >
                <Text style={[styles.shareBtnText, { fontFamily: typo.scriptMedium.fontFamily }]}>✦ SHARE THE LOOK ✦</Text>
              </Pressable>
              <Pressable
                style={styles.resetBtn}
                onPress={() => { suppressSuggestRef.current = false; reset(); setCity(''); }}
                accessibilityRole="button"
                accessibilityLabel="Ask again"
              >
                <Text style={[styles.resetText, { fontFamily: typo.scriptMedium.fontFamily }]}>ask again ♡</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {/* Off-screen share card */}
          {showResult && (
            <View style={{ position: 'absolute', left: Dimensions.get('window').width + 10, top: 0 }}>
              <ShareCard ref={shareCardRef} weather={weather!} verdict={verdict!} occasion={occasion} />
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {showMagicMoment && verdict && (
        <Animated.View style={[styles.magicOverlay, { opacity: magicOpacity }]} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={dismissMagicMoment} accessibilityRole="button" accessibilityLabel="Continue">
            <View style={styles.magicContent}>
              <Image source={require('../../logo-dark.png')} style={styles.magicLogo} resizeMode="contain" />
              <Text style={[styles.magicCity, { fontFamily: typo.displaySmall.fontFamily }]}>{city}</Text>
              <Text style={[styles.magicVibe, { fontFamily: typo.monoMicro.fontFamily }]}>{verdict.vibe.toUpperCase()}</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: y2kTokens.lavenderBg,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: 60 },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTopRule: {
    height: 2,
    backgroundColor: y2kTokens.deepPurple,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  headerTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 38,
    letterSpacing: 0,
    color: y2kTokens.deepPurple,
    lineHeight: 50,
  },
  headerStickers: {
    flexDirection: 'row',
    gap: 4,
  },
  headerSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSub: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    letterSpacing: 1.5,
    color: y2kTokens.mutedPurple,
  },
  headerDate: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: y2kTokens.mutedPurple,
  },
  headerBottomRule: {
    height: 1,
    backgroundColor: y2kTokens.mutedPurple,
    marginTop: spacing.sm,
    opacity: 0.5,
  },

  // Input panel
  inputPanel: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputCard: {
    borderWidth: 1.5,
    borderColor: y2kTokens.ink,
    borderRadius: y2kTokens.radius,
    padding: 4,
    backgroundColor: y2kTokens.cream,
    shadowColor: y2kTokens.deepPurple,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 4,
  },
  inputCardInner: {
    borderWidth: 1,
    borderColor: y2kTokens.ink,
    borderRadius: y2kTokens.radiusSm,
    backgroundColor: y2kTokens.cream,
    padding: spacing.md,
  },
  inputQ: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    letterSpacing: 1.5,
    color: y2kTokens.hotPink,
    marginBottom: spacing.sm,
  },
  input: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 26,
    lineHeight: 34,
    color: y2kTokens.ink,
    paddingVertical: spacing.sm,
    letterSpacing: 0,
  },
  inputRule: {
    height: 1.5,
    backgroundColor: y2kTokens.deepPurple,
    marginBottom: spacing.sm,
  },
  locationBtn: {
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  locationBtnText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    letterSpacing: 1,
    color: y2kTokens.mutedPurple,
  },

  // Recents
  recentsRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  recentsLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    letterSpacing: 2,
    color: y2kTokens.mutedPurple,
    marginBottom: spacing.sm,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: y2kTokens.deepPurple,
    borderRadius: 20,
    backgroundColor: y2kTokens.cream,
    overflow: 'hidden',
  },
  recentCityButton: {
    maxWidth: 180,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
  },
  recentChipPressed: {
    backgroundColor: y2kTokens.blush,
  },
  recentChipText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: y2kTokens.deepPurple,
    letterSpacing: 0.5,
  },
  recentRemove: {
    minWidth: 30,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1.5,
    borderLeftColor: y2kTokens.deepPurple,
  },
  recentRemoveText: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 12,
    color: y2kTokens.hotPink,
    letterSpacing: 0.5,
  },

  // CTA button
  ctaBtn: {
    backgroundColor: y2kTokens.hotPink,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: y2kTokens.radius,
    borderWidth: 1.5,
    borderColor: y2kTokens.ink,
    shadowColor: y2kTokens.deepPurple,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 5,
  },
  ctaBtnPressed: { opacity: 0.85 },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 16,
    lineHeight: 24,
    color: y2kTokens.cream,
    letterSpacing: 0,
    flex: 1,
  },

  // Error
  errorBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: y2kTokens.blush,
    borderWidth: 1.5,
    borderColor: y2kTokens.hotPink,
    borderRadius: y2kTokens.radiusSm,
  },
  errorLabel: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 12,
    letterSpacing: 2,
    color: y2kTokens.hotPink,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: y2kTokens.ink,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  retryText: {
    fontFamily: 'Knewave_400Regular',
    fontSize: 18,
    lineHeight: 28,
    color: y2kTokens.hotPink,
  },

  // Results
  results: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cacheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: y2kTokens.cream,
    borderRadius: y2kTokens.radiusSm,
    borderWidth: 1,
    borderColor: y2kTokens.mutedPurple,
    marginBottom: spacing.md,
  },
  cacheBadgeText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.5,
    color: y2kTokens.mutedPurple,
  },
  cacheRefresh: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: y2kTokens.hotPink,
    letterSpacing: 0.5,
  },
  logicCard: {
    paddingHorizontal: spacing.md,
    backgroundColor: y2kTokens.cream,
    borderWidth: 1.5,
    borderColor: y2kTokens.deepPurple,
    borderRadius: y2kTokens.radiusSm,
    shadowColor: y2kTokens.deepPurple,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
  },
  lookToggle: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: y2kTokens.deepPurple,
    borderRadius: y2kTokens.radiusSm,
    overflow: 'hidden',
  },
  lookToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: y2kTokens.cream,
  },
  lookToggleBtnActive: {
    backgroundColor: y2kTokens.deepPurple,
  },
  lookToggleText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    letterSpacing: 2,
    color: y2kTokens.deepPurple,
  },
  lookToggleTextActive: {
    color: y2kTokens.cream,
  },

  // Bottom actions
  shareBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: 16,
    backgroundColor: y2kTokens.hotPink,
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: y2kTokens.ink,
    shadowColor: y2kTokens.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  shareBtnText: {
    fontFamily: 'Knewave_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: y2kTokens.cream,
    letterSpacing: 1,
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  resetText: {
    fontFamily: 'Knewave_400Regular',
    fontSize: 22,
    lineHeight: 32,
    color: y2kTokens.mutedPurple,
  },
  magicOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: y2kTokens.deepPurple,
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
    tintColor: y2kTokens.lime,
  },
  magicCity: {
    fontSize: 48,
    lineHeight: 62,
    color: y2kTokens.cream,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  magicVibe: {
    fontSize: 11,
    color: y2kTokens.hotPink,
    letterSpacing: 3,
    textAlign: 'center',
  },
});
