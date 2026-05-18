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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppData } from '../contexts/AppContext';
import { useRecentCities } from '../hooks/useRecentCities';
import { useMagicMoment } from '../hooks/useMagicMoment';
import { GenderToggle, Gender } from '../components/GenderToggle';
import { OccasionPicker, Occasion } from '../components/OccasionPicker';
import { WeatherStrip } from '../components/WeatherStrip';
import { VerdictCard } from '../components/VerdictCard';
import { DressingLogicCard } from '../components/DressingLogicCard';
import { OutfitCard } from '../components/OutfitCard';
import { AvoidSection } from '../components/AvoidSection';
import { LoadingOracle } from '../components/LoadingOracle';
import { CitySuggestions } from '../components/CitySuggestions';
import { ShareCard } from '../components/ShareCard';
import { SkeletonResults } from '../components/SkeletonResults';
import { ChallengeCard } from '../components/ChallengeCard';
import { OracleImage } from '../components/OracleImage';
import { useWeeklyChallenge } from '../hooks/useWeeklyChallenge';
import { searchCities, CitySuggestion } from '../services/weather';
import {
  trackShareTapped, trackRecentCityTapped, trackAutocompleteCitySelected,
} from '../services/analytics';
import { AppColors, AppFonts, ThemeName, isEditorialTheme, isY2KTheme, isMondrianTheme, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useTempUnit } from '../contexts/TemperatureContext';
import { Y2KOracleScreen } from './y2k/Y2KOracleScreen';
import { MondrianOracleScreen } from './mondrian/MondrianOracleScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ArchiveImages, Reaction } from '../hooks/useArchive';

export function OracleScreen() {
  const { themeName } = useTheme();
  if (isY2KTheme(themeName)) return <Y2KOracleScreen />;
  if (isMondrianTheme(themeName)) return <MondrianOracleScreen />;
  return <EditorialOracleScreen />;
}

function EditorialOracleScreen() {
  const { colors, fonts, isDark, themeName } = useTheme();
  const { formatTemp } = useTempUnit();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors, fonts, themeName), [colors, fonts, themeName]);
  const { oracle, profileCtx, historyCtx, streakCtx, savedCtx, archiveCtx, oracleImages } = useAppData();
  const { status, weather, verdict, error, consult, consultByCoords, reset, cachedCity, cachedAt, isFromCache, isOffline } = oracle;
  const findArchiveEntry = archiveCtx.findEntry;
  const updateArchiveImages = archiveCtx.updateImages;
  const profile = profileCtx.profile;

  const [city, setCity]               = useState('');
  const [gender, setGender]           = useState<Gender>('Women');
  const [occasion, setOccasion]       = useState<Occasion>('Any');
  const [lookMode, setLookMode]       = useState<'polished' | 'casual'>('polished');
  const [imageView, setImageView]     = useState<'photo' | 'sketch'>('photo');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [suggestionsArmed, setSuggestionsArmed] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const debounceRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressSuggestRef = useRef(false);
  const searchSeqRef       = useRef(0);
  const autoLocationStartedRef = useRef(false);
  const scrollRef          = useRef<ScrollView>(null);
  const shareCardRef       = useRef<View>(null);
  const btnScale           = useRef(new Animated.Value(1)).current;
  const resultTranslateX   = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const resultOpacity      = useRef(new Animated.Value(0)).current;
  const toggleFade         = useRef(new Animated.Value(1)).current;
  const isFirstToggle      = useRef(true);
  const { magicOpacity, showMagicMoment, dismissMagicMoment, tryTriggerFirstConsult } = useMagicMoment();

  const isLoading = status === 'fetching-weather' || status === 'fetching-verdict';
  const showResult = status === 'done' && !!weather && !!verdict;

  const { recents, addCity, removeCity } = useRecentCities();
  const weeklyChallenge = useWeeklyChallenge(historyCtx.history);

  const activePhotoImage = lookMode === 'casual' ? oracleImages.night : oracleImages.day;
  const activeSketchImage = lookMode === 'casual' ? oracleImages.nightSketch : oracleImages.daySketch;
  const activeImage = imageView === 'sketch' ? activeSketchImage : activePhotoImage;

  const currentArchiveImages = useMemo<ArchiveImages>(() => ({
    day: oracleImages.day.url ?? undefined,
    night: oracleImages.night.url ?? undefined,
    daySketch: oracleImages.daySketch.url ?? undefined,
    nightSketch: oracleImages.nightSketch.url ?? undefined,
  }), [
    oracleImages.day.url,
    oracleImages.night.url,
    oracleImages.daySketch.url,
    oracleImages.nightSketch.url,
  ]);

  // Saved items matching current city+temp (individual outfit pieces)
  const wearAgainMatches = showResult && weather
    ? savedCtx.saved.filter(s =>
        s.city.toLowerCase() === city.toLowerCase() &&
        s.weather != null &&
        Math.abs(s.weather.temp - weather.temp) <= 5,
      )
    : [];

  // Full saved looks (archive entries) matching current city+temp — richer data source
  const archiveWearMatches = showResult && weather
    ? archiveCtx.entries.filter(e =>
        e.city.toLowerCase() === city.toLowerCase() &&
        Math.abs(e.weather.temp - weather.temp) <= 5,
      )
    : [];
  const bestArchiveMatch = archiveWearMatches[0] ?? null;
  const showWearAgain    = wearAgainMatches.length > 0 || archiveWearMatches.length > 0;

  // Pre-fill city from cache
  useEffect(() => {
    if (cachedCity && !city) {
      suppressSuggestRef.current = true;
      setSuggestionsArmed(false);
      setSuggestions([]);
      setCity(cachedCity);
    }
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
      tryTriggerFirstConsult(historyCtx.history.length);
      historyCtx.addEntry(city, gender, weather, verdict, occasion);
      streakCtx.recordConsult();
      if (verdict.foundingMember) {
        AsyncStorage.setItem('@outfit_oracle_founding_member', '1').catch(() => {});
      }
    }
  }, [status, isFromCache]);

  useEffect(() => {
    if (!showResult || !weather || !verdict) return;
    if (!Object.values(currentArchiveImages).some(Boolean)) return;
    const existing = findArchiveEntry(verdict.vibe, city);
    if (!existing) return;
    updateArchiveImages(existing.id, currentArchiveImages);
  }, [
    showResult,
    city,
    weather,
    verdict?.vibe,
    currentArchiveImages,
    findArchiveEntry,
    updateArchiveImages,
  ]);

  // Verdict arrival: horizontal wipe from right edge + fade, 600ms ease-in-out per motion spec
  useEffect(() => {
    if (status === 'done') {
      resultTranslateX.setValue(Dimensions.get('window').width);
      resultOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(resultTranslateX, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
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
    setImageView('photo');
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
      setSuggestionsArmed(false);
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

  useEffect(() => {
    if (autoLocationStartedRef.current || profileCtx.profileState.status === 'loading') return;
    if (status !== 'idle') return; // AppContext already auto-consulted or cache loaded
    autoLocationStartedRef.current = true;
    handleUseLocation();
  }, [profileCtx.profileState.status, status]);

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
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
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

          <GenderToggle selected={gender} onChange={setGender} />
          <OccasionPicker selected={occasion} onChange={setOccasion} />
          {recents.length > 0 && (
            <View style={styles.recentsRow}>
              <Text style={styles.recentsLabel}>RECENT</Text>
              <View style={styles.recentChips}>
                {recents.map(c => (
                  <View key={c} style={styles.recentChip}>
                    <Pressable
                      style={({ pressed }) => [styles.recentCityButton, pressed && styles.recentChipPressed]}
                      onPress={() => { trackRecentCityTapped(c); handleConsult(c); }}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${c} again`}
                    >
                      <Text style={styles.recentChipText} numberOfLines={1}>{c}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.recentRemove}
                      onPress={() => { Haptics.selectionAsync(); removeCity(c); }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${c} from recent cities`}
                    >
                      <MaterialCommunityIcons name="close" size={13} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}
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
            <Animated.View style={[styles.results, { opacity: resultOpacity, transform: [{ translateX: resultTranslateX }] }]}>
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
              {showWearAgain && (
                <View style={styles.wearAgainBanner}>
                  <Text style={styles.wearAgainLabel}>WEAR THIS AGAIN</Text>
                  {bestArchiveMatch ? (
                    <>
                      <Text style={styles.wearAgainVibe}>{bestArchiveMatch.verdict.vibe}</Text>
                      {bestArchiveMatch.note ? (
                        <Text style={styles.wearAgainNote}>"{bestArchiveMatch.note}"</Text>
                      ) : (
                        <Text style={styles.wearAgainText}>
                          {archiveWearMatches.length === 1
                            ? `Saved look for ${city} in similar conditions. The Oracle approves a repeat.`
                            : `${archiveWearMatches.length} saved looks for ${city} in similar conditions.`}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text style={styles.wearAgainText}>
                      {wearAgainMatches.length === 1
                        ? `You saved a look for ${city} in similar conditions. The Oracle approves a repeat.`
                        : `You have ${wearAgainMatches.length} saved looks for ${city} in similar conditions.`}
                    </Text>
                  )}
                </View>
              )}
              <OracleImage imageState={activeImage} />

              {/* Image mode arrow navigation */}
              {(activePhotoImage.status === 'done' || activeSketchImage.status !== 'idle') && (
                <View style={styles.imageNav}>
                  {imageView === 'sketch' ? (
                    <Pressable
                      style={styles.imageNavBtn}
                      onPress={() => setImageView('photo')}
                      accessibilityRole="button"
                      accessibilityLabel="Switch to editorial photo"
                    >
                      <Text style={[styles.imageNavText, { color: colors.textSecondary }]}>← PHOTO</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.imageNavBtn}
                      onPress={() => {
                        setImageView('sketch');
                        if (activeSketchImage.status === 'idle') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          activeSketchImage.trigger();
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Generate editorial fashion sketch"
                    >
                      <Text style={styles.imageNavText}>EDITORIAL SKETCH →</Text>
                    </Pressable>
                  )}
                </View>
              )}

              <WeatherStrip weather={weather} lastConsultedAt={cachedAt} />
              <DressingLogicCard weather={weather} formatTemp={formatTemp} />
              <VerdictCard verdict={verdict} />

              {/* ── REACTION / ARCHIVE ROW ── */}
              {(() => {
                const existing = archiveCtx.findEntry(verdict.vibe, city);
                const isArchived = !!existing;
                const reaction = existing?.reaction ?? null;
                const doSave = (r: Reaction) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (isArchived && existing) {
                    if (existing.reaction === r) {
                      archiveCtx.setReaction(existing.id, null);
                    } else {
                      archiveCtx.setReaction(existing.id, r);
                    }
                  } else {
                    archiveCtx.addEntry(city, gender, weather!, verdict, currentArchiveImages, occasion, r);
                    // Trigger night image so both day + night get patched into the entry
                    // as they complete. updateArchiveImages effect handles the patch.
                    oracleImages.night.trigger();
                  }
                };
                const doArchive = () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!isArchived) {
                    archiveCtx.addEntry(city, gender, weather!, verdict, currentArchiveImages, occasion, null);
                    oracleImages.night.trigger();
                  } else if (existing) {
                    archiveCtx.removeEntry(existing.id);
                  }
                };
                return (
                  <View style={styles.reactionRow}>
                    <Pressable
                      style={styles.reactionBtn}
                      onPress={() => doSave('liked')}
                      accessibilityRole="button"
                      accessibilityLabel="Like this outfit"
                    >
                      <MaterialCommunityIcons
                        name={reaction === 'liked' ? 'heart' : 'heart-outline'}
                        size={20}
                        color={reaction === 'liked' ? colors.scarletFg : colors.textMuted}
                      />
                      <Text style={[styles.reactionLabel, reaction === 'liked' && { color: colors.scarletFg }]}>
                        LIKE
                      </Text>
                    </Pressable>
                    <View style={styles.reactionDivider} />
                    <Pressable
                      style={styles.reactionBtn}
                      onPress={() => doArchive()}
                      accessibilityRole="button"
                      accessibilityLabel={isArchived ? 'Remove from archive' : 'Save to archive'}
                    >
                      <MaterialCommunityIcons
                        name={isArchived ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={isArchived ? colors.textSecondary : colors.textMuted}
                      />
                      <Text style={[styles.reactionLabel, isArchived && { color: colors.textSecondary }]}>
                        {isArchived ? 'SAVED' : 'SAVE'}
                      </Text>
                    </Pressable>
                    <View style={styles.reactionDivider} />
                    <Pressable
                      style={styles.reactionBtn}
                      onPress={() => doSave('disliked')}
                      accessibilityRole="button"
                      accessibilityLabel="Dislike this outfit"
                    >
                      <MaterialCommunityIcons
                        name={reaction === 'disliked' ? 'thumb-down' : 'thumb-down-outline'}
                        size={20}
                        color={reaction === 'disliked' ? colors.textSecondary : colors.textMuted}
                      />
                      <Text style={[styles.reactionLabel, reaction === 'disliked' && { color: colors.textSecondary }]}>
                        PASS
                      </Text>
                    </Pressable>
                  </View>
                );
              })()}

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
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  headerBottom: {
    height: 1,
    backgroundColor: colors.border,
  },
  inputSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  inputLabel: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 2.5, color: colors.textMuted, marginBottom: spacing.sm },
  input: { fontFamily: fonts.display, fontSize: 30, color: colors.textPrimary, paddingVertical: spacing.sm, letterSpacing: -0.5 },
  inputRule: { height: 1, backgroundColor: colors.borderHard, marginTop: 4 },
  locationBtn: { paddingVertical: spacing.sm, marginTop: spacing.xs, alignSelf: 'flex-start' },
  locationBtnText: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: colors.textMuted },
  recentsRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  recentsLabel: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 2.5, color: colors.textMuted, marginBottom: spacing.sm },
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  recentChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  recentCityButton: { maxWidth: 180, paddingLeft: spacing.md, paddingRight: spacing.sm, paddingVertical: 7 },
  recentChipPressed: { backgroundColor: colors.bgSurface },
  recentChipText: { fontFamily: fonts.mono, fontSize: 11, color: colors.textSecondary, letterSpacing: 0.3 },
  recentRemove: { minWidth: 30, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: colors.border },
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
    borderLeftWidth: 2, borderLeftColor: colors.scarletFg,
    paddingLeft: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  errorLabel: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 2, color: colors.scarletFg, marginBottom: spacing.sm },
  errorText: { fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing.md },
  retryText: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.scarletFg, letterSpacing: 0.5 },
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
    fontSize: 12,
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
  cacheBadgeText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.textMuted },
  cacheRefresh: { fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary, letterSpacing: 0.5 },
  shareBtn: {
    alignSelf: 'stretch', paddingVertical: 14, borderWidth: 1, borderColor: colors.borderHard,
    alignItems: 'center', marginBottom: spacing.md,
  },
  shareBtnText: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 2.5, color: colors.textPrimary },
  resetBtn: { alignSelf: 'center', paddingVertical: spacing.md, marginBottom: spacing.lg },
  resetText: { fontFamily: fonts.serif, fontSize: 18, color: colors.textSecondary, letterSpacing: 0.3 },
  reactionRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  reactionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 5,
  },
  reactionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  reactionDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  imageNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  imageNavBtn: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  imageNavText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  wearAgainBanner: {
    borderLeftWidth: 2,
    borderLeftColor: colors.scarletFg,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.scarletDim,
  },
  wearAgainLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.scarletFg,
    marginBottom: 4,
  },
  wearAgainVibe: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 22,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  wearAgainText: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  wearAgainNote: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
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
    fontSize: 11,
    color: 'rgba(250,249,246,0.40)',
    letterSpacing: 3,
    textAlign: 'center',
  },
}); }
