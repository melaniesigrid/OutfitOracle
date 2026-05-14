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
  Dimensions,
  Share,
  Animated,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
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
import { useStyleProfile, BUDGET_TIERS } from '../hooks/useStyleProfile';
import { useOutfitHistory } from '../hooks/useOutfitHistory';
import { useConsultStreak } from '../hooks/useConsultStreak';
import { GenderToggle, Gender } from '../components/GenderToggle';
import { WeatherStrip } from '../components/WeatherStrip';
import { VerdictCard } from '../components/VerdictCard';
import { OutfitCard } from '../components/OutfitCard';
import { AvoidSection } from '../components/AvoidSection';
import { LoadingOracle } from '../components/LoadingOracle';
import { CitySuggestions } from '../components/CitySuggestions';
import { ShareCard } from '../components/ShareCard';
import { StyleOnboarding } from '../components/StyleOnboarding';
import { SkeletonResults } from '../components/SkeletonResults';
import { searchCities, CitySuggestion } from '../services/weather';
import * as Location from 'expo-location';
import { colors, fonts, spacing } from '../theme';
import {
  trackAppOpened,
  trackShareTapped,
  trackRecentCityTapped,
  trackAutocompleteCitySelected,
} from '../services/analytics';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';

export function HomeScreen() {
  const [city, setCity]               = useState('');
  const [gender, setGender]           = useState<Gender>('Women');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const debounceRef         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressSuggestRef  = useRef(false);

  const { status, weather, verdict, error, consult, consultByCoords, reset, cachedCity, cachedAt, isFromCache } = useOracle(CLAUDE_API_KEY);
  const [locationLoading, setLocationLoading] = useState(false);
  const { recents, addCity } = useRecentCities();
  const { profileState, profile, saveProfile, edit } = useStyleProfile();
  const { history, addEntry } = useOutfitHistory();
  const { streak, rankTitle, newMilestone, newRank, recordConsult, clearMilestone, clearRank } = useConsultStreak();
  const shareCardRef = useRef<View>(null);

  // ── Animation values ──────────────────────────────────────────────────────
  const mastheadOpacity = useRef(new Animated.Value(0)).current;
  const mastheadY       = useRef(new Animated.Value(20)).current;
  const btnScale        = useRef(new Animated.Value(1)).current;
  const streakScale     = useRef(new Animated.Value(0)).current;
  const bannerOpacity   = useRef(new Animated.Value(0)).current;
  const bannerY         = useRef(new Animated.Value(-14)).current;
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerContent, setBannerContent] = useState<{ milestone: number | null; rank: string | null }>({ milestone: null, rank: null });

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

  // Track app open once fonts + cache state are resolved
  useEffect(() => {
    if (fontsLoaded) trackAppOpened(isFromCache);
  }, [fontsLoaded]);

  // Pre-fill city from cache on mount
  useEffect(() => {
    if (cachedCity && !city) setCity(cachedCity);
  }, [cachedCity]);

  // Haptic only for fresh consults, not cache loads
  useEffect(() => {
    if (status === 'done' && !isFromCache) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

  // Save to history and record streak after every fresh successful consult
  useEffect(() => {
    if (status === 'done' && !isFromCache && weather && verdict) {
      addEntry(city, gender, weather, verdict);
      recordConsult();
    }
  }, [status, isFromCache]);

  // Haptic when a streak milestone or rank is unlocked
  useEffect(() => {
    if (newMilestone !== null || newRank !== null) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [newMilestone, newRank]);

  // Masthead entrance — fades + rises from slight offset on mount
  useEffect(() => {
    if (!fontsLoaded) return;
    Animated.parallel([
      Animated.timing(mastheadOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(mastheadY,       { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fontsLoaded]);

  // Streak badge pops in when first earned
  useEffect(() => {
    if (streak > 0) {
      Animated.spring(streakScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start();
    }
  }, [streak > 0]);

  // Milestone / rank banner: slide + fade in, snapshot content so it persists during dismiss animation
  useEffect(() => {
    if (newMilestone !== null || newRank !== null) {
      setBannerContent({ milestone: newMilestone, rank: newRank });
      bannerOpacity.setValue(0);
      bannerY.setValue(-14);
      setBannerVisible(true);
      Animated.parallel([
        Animated.timing(bannerOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(bannerY,       { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      ]).start();
    }
  }, [newMilestone, newRank]);

  const dismissBanner = () => {
    Animated.parallel([
      Animated.timing(bannerOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(bannerY,       { toValue: -8, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setBannerVisible(false);
      clearMilestone();
      clearRank();
    });
  };

  const handleShare = async () => {
    if (!shareCardRef.current || !verdict) return;
    trackShareTapped(city, verdict.vibe);
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      await Share.share({ url: uri });
    } catch {
      // user cancelled or sharing unavailable
    }
  };

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
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [city, isLoading]);

  const handleConsult = (overrideCity?: string) => {
    const target = (overrideCity ?? city).trim();
    if (!target || isLoading) return;
    suppressSuggestRef.current = true;
    setSuggestions([]);
    setCity(target);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCity(target);
    consult(target, gender, profile);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 360, animated: true }), 400);
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
      const detectedCity = place.city ?? place.subregion ?? place.region ?? '';
      const detectedCountry = place.isoCountryCode ?? place.country ?? '';
      if (!detectedCity) return;

      suppressSuggestRef.current = true;
      setSuggestions([]);
      setCity(detectedCity);
      addCity(detectedCity);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      consultByCoords(
        loc.coords.latitude,
        loc.coords.longitude,
        detectedCity,
        detectedCountry,
        gender,
        profile,
      );
      setTimeout(() => scrollRef.current?.scrollTo({ y: 360, animated: true }), 400);
    } catch {
      // Permission denied or GPS unavailable — silent fallback, user can type the city
    } finally {
      setLocationLoading(false);
    }
  };


  if (!fontsLoaded || profileState.status === 'loading') return <View style={styles.root} />;
  if (profileState.status === 'not-set') {
    return <StyleOnboarding onSave={saveProfile} />;
  }

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
          <Animated.View style={[styles.masthead, { opacity: mastheadOpacity, transform: [{ translateY: mastheadY }] }]}>
            <Text style={styles.mastheadKicker}>— WEATHER-POWERED STYLE —</Text>
            <Text style={styles.mastheadTitle1}>OUTFIT</Text>
            <Text style={styles.mastheadTitle2}>Oracle</Text>
            <View style={styles.mastheadRule} />
            <View style={styles.mastheadFootRow}>
              <Text style={styles.mastheadTagline}>Your unsolicited style authority</Text>
              <View style={styles.mastheadBadges}>
                {streak > 0 && (
                  <Animated.View style={{ transform: [{ scale: streakScale }] }}>
                    <Text style={styles.streakBadge}>
                      {streak}-DAY {rankTitle.toUpperCase()}
                    </Text>
                  </Animated.View>
                )}
                {profile && (
                  <Pressable
                    onPress={edit}
                    accessibilityRole="button"
                    accessibilityLabel="Edit style profile"
                  >
                    <Text style={styles.profileBadge}>
                      {profile.keywords.slice(0, 2).join(' · ')}
                      {profile.keywords.length > 2 ? ` +${profile.keywords.length - 2}` : ''}
                      {' · '}{BUDGET_TIERS.find(b => b.id === profile.budget)?.label ?? ''}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>

          {/* ── MILESTONE / RANK BANNER ── */}
          {bannerVisible && (
            <Animated.View style={[styles.milestoneBanner, { opacity: bannerOpacity, transform: [{ translateY: bannerY }] }]}>
              <Pressable
                onPress={dismissBanner}
                accessibilityRole="button"
                accessibilityLabel={bannerContent.rank ? `Oracle rank unlocked: ${bannerContent.rank}` : `${bannerContent.milestone}-day streak milestone reached`}
              >
                <Text style={styles.milestoneKicker}>
                  {bannerContent.rank ? 'RANK UNLOCKED' : `${bannerContent.milestone}-DAY MILESTONE`}
                </Text>
                <Text style={styles.milestoneTitle}>
                  {bannerContent.rank ?? `The Oracle has noticed your devotion.`}
                </Text>
                <Text style={styles.milestoneDismiss}>Tap to dismiss</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ── BODY ── */}
          <View style={styles.body}>

            {/* Input */}
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
                accessibilityHint="Detects your city automatically via GPS"
              >
                <Text style={styles.locationBtnText}>
                  {locationLoading ? 'Detecting location…' : '+ Use my location'}
                </Text>
              </Pressable>
            </View>

            {/* City autocomplete */}
            <CitySuggestions
              suggestions={suggestions}
              onSelect={(name) => { trackAutocompleteCitySelected(name); handleConsult(name); }}
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

            {/* Gender */}
            <GenderToggle selected={gender} onChange={setGender} />

            {/* CTA */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  pressed && styles.btnPressed,
                  isLoading && styles.btnDisabled,
                ]}
                onPress={() => handleConsult()}
                onPressIn={() => Animated.spring(btnScale, { toValue: 0.97, tension: 150, friction: 8, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(btnScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start()}
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
            </Animated.View>

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
            {isLoading && <SkeletonResults />}

            {/* Results */}
            {showResult ? (
              <View style={styles.results}>
                {isFromCache && cachedAt ? (
                  <View style={styles.cacheBadge}>
                    <Text style={styles.cacheBadgeText}>
                      LAST CONSULTED · {new Date(cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Pressable onPress={() => handleConsult(city)} accessibilityRole="button" accessibilityLabel="Refresh result">
                      <Text style={styles.cacheRefresh}>↻ Refresh</Text>
                    </Pressable>
                  </View>
                ) : null}
                <WeatherStrip weather={weather} />
                <VerdictCard verdict={verdict} />
                {verdict.outfits.map((item, i) => (
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
                <Pressable
                  style={styles.shareBtn}
                  onPress={handleShare}
                  accessibilityRole="button"
                  accessibilityLabel="Share the Oracle's verdict"
                  accessibilityHint="Creates an image of your outfit verdict to share"
                >
                  <Text style={styles.shareBtnText}>SHARE THE LOOK →</Text>
                </Pressable>
                <Pressable
                  style={styles.resetBtn}
                  onPress={() => { suppressSuggestRef.current = false; reset(); setCity(''); }}
                  accessibilityRole="button"
                  accessibilityLabel="Ask again"
                  accessibilityHint="Clears the current result and returns to the search"
                >
                  <Text style={styles.resetText}>Ask Again →</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Off-screen share card — rendered for capture only */}
            {showResult ? (
              <View style={styles.shareCardAnchor}>
                <ShareCard ref={shareCardRef} weather={weather} verdict={verdict} />
              </View>
            ) : null}

            {/* Oracle Archives — history */}
            {history.length > 0 && (
              <View style={styles.archiveSection}>
                <Text style={styles.archiveLabel}>ORACLE ARCHIVES</Text>
                {history.map(entry => (
                  <Pressable
                    key={entry.id}
                    style={({ pressed }) => [styles.archiveRow, pressed && styles.archiveRowPressed]}
                    onPress={() => handleConsult(entry.city)}
                    accessibilityRole="button"
                    accessibilityLabel={`Re-consult Oracle for ${entry.city}`}
                  >
                    <View style={styles.archiveDate}>
                      <Text style={styles.archiveDateDay}>
                        {new Date(entry.consultedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={styles.archiveDateTime}>
                        {new Date(entry.consultedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={styles.archiveCenter}>
                      <Text style={styles.archiveCity}>{entry.city}</Text>
                      <Text style={styles.archiveVibe}>{entry.verdict.vibe}</Text>
                    </View>
                    <Text style={styles.archiveTemp}>{entry.weather.temp}°</Text>
                  </Pressable>
                ))}
              </View>
            )}

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
  cacheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgSurface,
    marginBottom: spacing.md,
  },
  cacheBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  cacheRefresh: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  shareBtn: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderHard,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shareBtnText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.textPrimary,
  },
  shareCardAnchor: {
    position: 'absolute',
    left: Dimensions.get('window').width + 10,
    top: 0,
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

  /* Location button */
  locationBtn: {
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  locationBtnText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },

  /* Masthead footer row — tagline + badges */
  mastheadFootRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  mastheadBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  streakBadge: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: colors.scarlet,
  },
  profileBadge: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    color: 'rgba(250,249,246,0.40)',
  },

  /* Milestone / rank banner */
  milestoneBanner: {
    backgroundColor: colors.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.scarlet,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 4,
  },
  milestoneKicker: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 2.5,
    color: colors.scarlet,
  },
  milestoneTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: '#FAF9F6',
    letterSpacing: -0.3,
  },
  milestoneDismiss: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    color: 'rgba(250,249,246,0.30)',
    marginTop: 4,
  },

  /* Oracle Archives */
  archiveSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  archiveLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  archiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  archiveRowPressed: {
    backgroundColor: colors.bgSurface,
  },
  archiveDate: {
    width: 52,
    marginRight: spacing.md,
  },
  archiveDateDay: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  archiveDateTime: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  archiveCenter: {
    flex: 1,
  },
  archiveCity: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  archiveVibe: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  archiveTemp: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
});
