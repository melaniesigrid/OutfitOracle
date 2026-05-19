import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, RefreshControl,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
  Dimensions, Animated, Easing, Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppData } from '../../contexts/AppContext';
import { useRecentCities } from '../../hooks/useRecentCities';
import { useMagicMoment } from '../../hooks/useMagicMoment';
import type { Gender } from '../../components/GenderToggle';
import type { Occasion } from '../../components/OccasionPicker';
import { CitySuggestions } from '../../components/CitySuggestions';
import { LoadingOracle } from '../../components/LoadingOracle';
import { SkeletonResults } from '../../components/SkeletonResults';
import { ShareCard } from '../../components/ShareCard';
import { DressingLogicCard } from '../../components/DressingLogicCard';
import { WeatherAlertBanner } from '../../components/WeatherAlertBanner';
import { useWeeklyChallenge } from '../../hooks/useWeeklyChallenge';
import { searchCities, CitySuggestion } from '../../services/weather';
import {
  trackShareTapped, trackRecentCityTapped, trackAutocompleteCitySelected,
} from '../../services/analytics';
import { hasNightOutfit, selectOutfitsForLook } from '../../utils/outfitSelection';
import { formatLocationTimeWithCue } from '../../utils/locationTime';
import { mondrianTokens, spacing } from '../../theme';
import { useTempUnit } from '../../contexts/TemperatureContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { red, blue, yellow, black, white, gridLine } = mondrianTokens;

// ─── Memphis pattern (shared with TodayScreen) ────────────────────────────────

const DASHES: Array<{ top: number; left: number; angle: number; len: number }> = [
  { top: 8,  left: 18,  angle: -45, len: 10 },
  { top: 22, left: 60,  angle: 30,  len: 8  },
  { top: 5,  left: 110, angle: 90,  len: 7  },
  { top: 18, left: 155, angle: -20, len: 9  },
  { top: 30, left: 200, angle: 55,  len: 8  },
  { top: 7,  left: 248, angle: -70, len: 10 },
  { top: 25, left: 290, angle: 15,  len: 7  },
  { top: 12, left: 335, angle: -35, len: 9  },
  { top: 40, left: 40,  angle: 80,  len: 8  },
  { top: 45, left: 88,  angle: -55, len: 7  },
  { top: 38, left: 135, angle: 40,  len: 10 },
  { top: 50, left: 178, angle: -10, len: 8  },
  { top: 42, left: 225, angle: 65,  len: 7  },
  { top: 55, left: 270, angle: -30, len: 9  },
  { top: 44, left: 315, angle: 50,  len: 8  },
];

const DOTS: Array<{ top: number; left: number }> = [
  { top: 15, left: 42  },
  { top: 28, left: 94  },
  { top: 10, left: 136 },
  { top: 33, left: 185 },
  { top: 8,  left: 232 },
  { top: 20, left: 278 },
  { top: 35, left: 320 },
  { top: 48, left: 55  },
  { top: 52, left: 100 },
  { top: 46, left: 150 },
];

function MemphisStrip() {
  return (
    <View style={{ height: 56, width: '100%', backgroundColor: white, overflow: 'hidden' }}>
      {DASHES.map((d, i) => (
        <View key={`d${i}`} style={{
          position: 'absolute', top: d.top, left: d.left,
          width: d.len, height: 1.5, backgroundColor: black,
          transform: [{ rotate: `${d.angle}deg` }],
        }} />
      ))}
      {DOTS.map((d, i) => (
        <View key={`dot${i}`} style={{
          position: 'absolute', top: d.top, left: d.left,
          width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: black,
        }} />
      ))}
    </View>
  );
}

// ─── Grid divider ─────────────────────────────────────────────────────────────

function GridLine() {
  return <View style={{ height: gridLine, backgroundColor: black, width: '100%' }} />;
}

// ─── Section bar ─────────────────────────────────────────────────────────────

function SectionBar({ label, bg, textColor }: { label: string; bg: string; textColor: string }) {
  return (
    <View>
      <GridLine />
      <View style={{ backgroundColor: bg, paddingHorizontal: 14, paddingVertical: 8 }}>
        <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 12, letterSpacing: 3, color: textColor }}>
          {label}
        </Text>
      </View>
      <GridLine />
    </View>
  );
}

// ─── Outfit result row ────────────────────────────────────────────────────────

const ACCENT_COLORS: Record<string, { bg: string; text: string }> = {
  mint:     { bg: blue,   text: white  },
  lavender: { bg: red,    text: white  },
  coral:    { bg: yellow, text: black  },
  lemon:    { bg: white,  text: black  },
  iris:     { bg: black,  text: white  },
};

function OutfitRow({ item, onSave, isSaved }: {
  item: { category: string; item: string; detail: string; accentColor: string };
  onSave?: () => void;
  isSaved?: boolean;
}) {
  const { bg } = ACCENT_COLORS[item.accentColor] ?? { bg: white, text: black };
  return (
    <View>
      <GridLine />
      <View style={{ flexDirection: 'row', minHeight: 64 }}>
        <View style={{ width: 6, backgroundColor: bg }} />
        <View style={{ flex: 1, padding: 12, backgroundColor: white }}>
          <Text style={s.outfitCategory}>{item.category.toUpperCase()}</Text>
          <Text style={s.outfitItem}>{item.item}</Text>
          <Text style={s.outfitDetail}>{item.detail}</Text>
        </View>
        {onSave && (
          <Pressable
            onPress={onSave}
            style={{ width: 44, backgroundColor: white, alignItems: 'center', justifyContent: 'center' }}
            hitSlop={8}
            accessibilityLabel={isSaved ? 'Remove from saved looks' : 'Save to looks'}
          >
            <MaterialCommunityIcons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={18}
              color={isSaved ? red : '#AAAAAA'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MondrianOracleScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { formatTemp } = useTempUnit();
  const { magicOpacity, showMagicMoment, dismissMagicMoment, tryTriggerFirstConsult } = useMagicMoment();

  const { oracle, profileCtx, historyCtx, streakCtx, savedCtx, archiveCtx } = useAppData();
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
  const resultTranslateX   = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const toggleFade         = useRef(new Animated.Value(1)).current;
  const isFirstToggle      = useRef(true);
  const autoLocationStartedRef = useRef(false);

  const isLoading  = status === 'fetching-weather' || status === 'fetching-verdict';
  const showResult = status === 'done' && !!weather && !!verdict;
  const hasNightLook = hasNightOutfit(verdict);
  const cachedAtLabel = formatLocationTimeWithCue(cachedAt, weather?.utcOffsetSeconds);

  const { recents, addCity, removeCity } = useRecentCities();
  const weeklyChallenge = useWeeklyChallenge(historyCtx.history);

  const wearAgainMatches = showResult && weather
    ? savedCtx.saved.filter(sv =>
        sv.city.toLowerCase() === city.toLowerCase() &&
        sv.weather != null &&
        Math.abs(sv.weather.temp - weather.temp) <= 5,
      )
    : [];

  const archiveWearMatches = showResult && weather
    ? archiveCtx.entries.filter(e =>
        e.city.toLowerCase() === city.toLowerCase() &&
        Math.abs(e.weather.temp - weather.temp) <= 5,
      )
    : [];
  const bestArchiveMatch = archiveWearMatches[0] ?? null;
  const showWearAgain    = wearAgainMatches.length > 0 || archiveWearMatches.length > 0;

  useEffect(() => {
    if (cachedCity && !city) {
      suppressSuggestRef.current = true;
      setSuggestionsArmed(false);
      setSuggestions([]);
      setCity(cachedCity);
    }
  }, [cachedCity]);

  useEffect(() => {
    if (status === 'done' && !isFromCache) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

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
    if (status === 'done') {
      isFirstToggle.current = true;
      toggleFade.stopAnimation();
      toggleFade.setValue(1);
      setLookMode('polished');
      resultTranslateX.setValue(Dimensions.get('window').width);
      Animated.timing(resultTranslateX, {
        toValue: 0, duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [status, verdict?.vibe, weather?.city]);

  useEffect(() => {
    if (isFirstToggle.current) { isFirstToggle.current = false; return; }
    toggleFade.setValue(0);
    Animated.timing(toggleFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [lookMode]);

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
    setTimeout(() => scrollRef.current?.scrollTo({ y: 340, animated: true }), 400);
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
      setTimeout(() => scrollRef.current?.scrollTo({ y: 340, animated: true }), 400);
    } catch { /* GPS silent fallback */ }
    finally { setLocationLoading(false); }
  };

  useEffect(() => {
    if (autoLocationStartedRef.current || profileCtx.profileState.status === 'loading') return;
    autoLocationStartedRef.current = true;
    handleUseLocation();
  }, [profileCtx.profileState.status]);

  const handleShare = async () => {
    if (!shareCardRef.current || !verdict) return;
    trackShareTapped(city, verdict.vibe);
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      await Share.share({ url: uri });
    } catch { /* cancelled */ }
  };

  const currentOutfits = useMemo(
    () => selectOutfitsForLook(verdict, lookMode),
    [lookMode, verdict],
  );

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={black} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            showResult ? (
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => handleConsult(city)}
                tintColor={red}
              />
            ) : undefined
          }
        >
          {/* ── HEADER ── */}
          <MemphisStrip />
          <GridLine />
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>THE ORACLE.</Text>
              <Text style={s.headerSub}>SUBMIT THE BRIEF</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={{ padding: 6 }}
              accessibilityLabel="Settings"
            >
              <MaterialCommunityIcons name="cog-outline" size={20} color={yellow} />
            </Pressable>
          </View>

          {/* ── INPUT PANEL (yellow) ── */}
          <SectionBar label="ENTER YOUR CITY" bg={yellow} textColor={black} />
          <View style={s.inputPanel}>
            <TextInput
              value={city}
              onChangeText={t => {
                suppressSuggestRef.current = false;
                setSuggestionsArmed(true);
                setCity(t);
                if (!t.trim()) setSuggestions([]);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setSuggestionsArmed(false);
                  setSuggestions([]);
                }, 120);
              }}
              onSubmitEditing={() => handleConsult()}
              placeholder="CITY NAME"
              placeholderTextColor="#888888"
              style={s.input}
              autoCapitalize="words"
              returnKeyType="go"
            />
            <View style={{ width: gridLine, backgroundColor: black }} />
            <Pressable
              onPress={handleUseLocation}
              style={({ pressed }) => [s.locBtn, { opacity: pressed ? 0.7 : 1 }]}
              accessibilityLabel="Use current location"
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={18} color={white} />
            </Pressable>
          </View>
          <GridLine />

          {suggestions.length > 0 && (
            <CitySuggestions
              suggestions={suggestions}
              onSelect={name => {
                trackAutocompleteCitySelected(name);
                suppressSuggestRef.current = true;
                setSuggestionsArmed(false);
                setSuggestions([]);
                setCity(name);
                handleConsult(name);
              }}
            />
          )}

          {/* ── GENDER ── */}
          <SectionBar label="DRESSING FOR" bg={black} textColor={white} />
          <View style={s.chipsRow}>
            {(['Women', 'Men', 'Anyone'] as Gender[]).map(g => (
              <Pressable
                key={g}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGender(g); }}
                style={[s.chip, gender === g && s.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: gender === g }}
              >
                <Text style={[s.chipText, gender === g && s.chipActiveText]}>{g.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
          <GridLine />

          {/* ── OCCASION ── */}
          <SectionBar label="OCCASION" bg={yellow} textColor={black} />
          <View style={s.chipsRow}>
            {(['Any', 'Work', 'Date', 'Event', 'Weekend', 'Active'] as Occasion[]).map(o => (
              <Pressable
                key={o}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOccasion(o); }}
                style={[s.chip, occasion === o && s.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: occasion === o }}
              >
                <Text style={[s.chipText, occasion === o && s.chipActiveText]}>{o.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
          <GridLine />

          {/* ── RECENT CITIES ── */}
          {recents.length > 0 && (
            <>
              <SectionBar label="RECENT" bg={black} textColor={yellow} />
              <View style={s.recentsRow}>
                {recents.slice(0, 4).map(r => (
                  <View key={r} style={s.recentChip}>
                    <Pressable
                      onPress={() => {
                        trackRecentCityTapped(r);
                        setSuggestionsArmed(false);
                        setSuggestions([]);
                        setCity(r);
                        handleConsult(r);
                      }}
                      style={({ pressed }) => [s.recentCityButton, pressed && s.recentChipPressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${r} again`}
                    >
                      <Text style={s.recentText} numberOfLines={1}>{r.toUpperCase()}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { Haptics.selectionAsync(); removeCity(r); }}
                      style={s.recentRemove}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${r} from recent cities`}
                    >
                      <Text style={s.recentRemoveText}>X</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── WEEKLY CHALLENGE ── */}
          {weeklyChallenge.challenge && (
            <>
              <SectionBar
                label={weeklyChallenge.completed ? 'CHALLENGE COMPLETE' : "THIS WEEK'S CHALLENGE"}
                bg={weeklyChallenge.completed ? red : yellow}
                textColor={weeklyChallenge.completed ? white : black}
              />
              <View style={s.challengePanel}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.challengeTitle, weeklyChallenge.completed && { color: red }]}>
                    {weeklyChallenge.challenge.title}
                  </Text>
                  {!weeklyChallenge.completed && (
                    <Text style={s.challengeBrief}>{weeklyChallenge.challenge.brief}</Text>
                  )}
                  {weeklyChallenge.completed && (
                    <Text style={s.challengeDone}>The Oracle notes the consistency.</Text>
                  )}
                </View>
                <Text style={[s.challengeDays, weeklyChallenge.completed && { color: red }]}>
                  {weeklyChallenge.completed ? '✓' : `${weeklyChallenge.daysLeft}D`}
                </Text>
              </View>
              <GridLine />
            </>
          )}

          {/* ── CONSULT BUTTON ── */}
          <Pressable
            onPress={() => handleConsult()}
            disabled={isLoading || !city.trim()}
            style={({ pressed }) => [s.consultBtn, pressed && { opacity: 0.75 }]}
          >
            <Text style={s.consultBtnText}>
              {isLoading ? 'CONSULTING...' : 'CONSULT THE ORACLE'}
            </Text>
          </Pressable>
          <GridLine />

          {/* ── ERROR ── */}
          {status === 'error' && error && (
            <>
              <SectionBar label="ERROR" bg={red} textColor={white} />
              <View style={s.errorPanel}>
                <Text style={s.errorText}>{error}</Text>
                <Pressable onPress={() => handleConsult()} style={s.retryBtn}>
                  <Text style={s.retryText}>RETRY</Text>
                </Pressable>
              </View>
              <GridLine />
            </>
          )}

          {/* ── LOADING ── */}
          {isLoading && (
            <>
              <SectionBar label="PROCESSING..." bg={blue} textColor={white} />
              <LoadingOracle status={status} />
              <SkeletonResults />
            </>
          )}

          {/* ── RESULTS ── */}
          {showResult && (
            <Animated.View style={{ transform: [{ translateX: resultTranslateX }] }}>

              {/* Cache badge */}
              {isFromCache && cachedAt && (
                <View style={s.cacheBadge}>
                  <Text style={s.cacheBadgeText}>
                    {isOffline
                      ? `OFFLINE — CACHED · ${cachedAtLabel}`
                      : `LAST CONSULTED · ${cachedAtLabel}`}
                  </Text>
                  {!isOffline && (
                    <Pressable onPress={() => handleConsult(city)}>
                      <Text style={s.cacheRefresh}>↻ Refresh</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Wear again */}
              {showWearAgain && (
                <View style={s.wearAgainBanner}>
                  <Text style={s.wearAgainLabel}>WEAR THIS AGAIN</Text>
                  {bestArchiveMatch ? (
                    <>
                      <Text style={s.wearAgainVibe}>{bestArchiveMatch.verdict.vibe}</Text>
                      {bestArchiveMatch.note ? (
                        <Text style={s.wearAgainNote}>"{bestArchiveMatch.note}"</Text>
                      ) : (
                        <Text style={s.wearAgainText}>
                          {archiveWearMatches.length === 1
                            ? `Saved look for ${city} in similar conditions.`
                            : `${archiveWearMatches.length} saved looks for ${city} in similar conditions.`}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text style={s.wearAgainText}>
                      {wearAgainMatches.length === 1
                        ? `You saved a look for ${city} in similar conditions.`
                        : `You have ${wearAgainMatches.length} saved looks for ${city} in similar conditions.`}
                    </Text>
                  )}
                </View>
              )}

              {/* Weather summary */}
              <SectionBar label="WEATHER BRIEF" bg={black} textColor={yellow} />
              <WeatherAlertBanner alerts={weather.alerts} />
              <View style={{ flexDirection: 'row', minHeight: 80 }}>
                <View style={{ flex: 1, backgroundColor: red, padding: 14 }}>
                  <Text style={s.weatherTemp}>{formatTemp(weather.temp)}</Text>
                  <Text style={s.weatherCity}>{weather.city}</Text>
                </View>
                <View style={{ width: gridLine, backgroundColor: black }} />
                <View style={{ flex: 1, backgroundColor: white, padding: 14 }}>
                  <Text style={s.weatherCondition}>{weather.conditionLabel.toUpperCase()}</Text>
                  <Text style={s.weatherHighLow}>
                    {weather.daily?.[0] ? `H ${formatTemp(weather.daily[0].tempMax)} L ${formatTemp(weather.daily[0].tempMin)}` : ''}
                  </Text>
                  <Text style={s.weatherWind}>{weather.windSpeed} KM/H</Text>
                </View>
              </View>
              <GridLine />
              <DressingLogicCard weather={weather} formatTemp={formatTemp} style={s.logicPanel} />
              <GridLine />

              {/* Verdict */}
              <SectionBar label="THE VERDICT" bg={red} textColor={white} />
              <View style={s.verdictPanel}>
                <Text style={s.verdictVibe}>{verdict.vibe.toUpperCase()}</Text>
                <Text style={s.verdictText}>{verdict.verdict}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View key={i} style={{ flex: 1, height: 4, backgroundColor: i <= verdict.rating ? red : '#DDDDDD' }} />
                  ))}
                </View>
              </View>

              {/* Look toggle */}
              {hasNightLook ? (
                <>
                  <GridLine />
                  <View style={{ flexDirection: 'row' }}>
                    {(['polished', 'casual'] as const).map(m => (
                      <Pressable
                        key={m}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLookMode(m); }}
                        style={[
                          s.lookToggleBtn,
                          { backgroundColor: lookMode === m ? black : '#F0F0F0' },
                        ]}
                      >
                        <Text style={[s.lookToggleText, { color: lookMode === m ? white : '#555555' }]}>
                          {m.toUpperCase()}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              {/* Outfits */}
              <SectionBar label="WEAR THIS" bg={blue} textColor={white} />
              <Animated.View style={{ opacity: toggleFade }}>
                {currentOutfits.map((item, i) => (
                  <OutfitRow
                    key={`${lookMode}-${i}`}
                    item={item}
                    isSaved={savedCtx.isSaved(item as any, city)}
                    onSave={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (savedCtx.isSaved(item as any, city)) {
                        savedCtx.removeOutfit(item as any, city);
                      } else {
                        savedCtx.saveOutfit(
                          item as any, city, verdict.vibe,
                          weather ? { temp: weather.temp, conditionLabel: weather.conditionLabel } : undefined,
                        );
                      }
                    }}
                  />
                ))}
                <GridLine />
              </Animated.View>

              {/* Avoid */}
              {verdict.avoid?.length > 0 && (
                <>
                  <SectionBar label="LEAVE BEHIND" bg={yellow} textColor={black} />
                  <View style={s.avoidPanel}>
                    {verdict.avoid.map((a, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                        <View style={{ width: 4, height: 4, backgroundColor: red, marginTop: 5 }} />
                        <Text style={s.avoidText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                  <GridLine />
                </>
              )}

              {/* Share */}
              <Pressable onPress={handleShare} style={s.shareBtn} accessibilityLabel="Share the Oracle's verdict">
                <Text style={s.shareBtnText}>SHARE THE LOOK →</Text>
              </Pressable>

              {/* Reset */}
              <Pressable onPress={reset} style={s.resetBtn}>
                <Text style={s.resetText}>NEW CONSULTATION</Text>
              </Pressable>
              <GridLine />

            </Animated.View>
          )}

          {/* Off-screen share card */}
          {showResult && (
            <View style={{ position: 'absolute', left: Dimensions.get('window').width + 10, top: 0 }}>
              <ShareCard ref={shareCardRef} weather={weather!} verdict={verdict!} occasion={occasion} />
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Magic moment ── */}
      {showMagicMoment && (
        <Animated.View style={[StyleSheet.absoluteFillObject, s.magicOverlay, { opacity: magicOpacity }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={dismissMagicMoment} />
          <View style={s.magicCard}>
            <Text style={s.magicLabel}>FIRST CONSULT</Text>
            <Text style={s.magicText}>The grid has spoken.{'\n'}Welcome to the Oracle.</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: white,
  },
  scroll: { flex: 1, backgroundColor: white },
  content: { paddingBottom: 20 },

  header: {
    backgroundColor: black,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 36,
    color: white,
    letterSpacing: 2,
    lineHeight: 38,
  },
  headerSub: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: yellow,
    letterSpacing: 2.5,
    marginTop: 4,
  },

  // Input
  inputPanel: {
    flexDirection: 'row',
    backgroundColor: yellow,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontFamily: 'Montserrat_900Black',
    fontSize: 14,
    color: black,
    letterSpacing: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  locBtn: {
    width: 52,
    backgroundColor: black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    backgroundColor: white,
    borderBottomWidth: gridLine,
    borderBottomColor: black,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: gridLine,
    borderRightColor: black,
    borderBottomWidth: gridLine,
    borderBottomColor: black,
    backgroundColor: white,
  },
  recentCityButton: {
    maxWidth: 180,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
  },
  recentChipPressed: {
    backgroundColor: yellow,
  },
  recentText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: black,
    letterSpacing: 1.5,
  },
  recentRemove: {
    width: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: gridLine,
    borderLeftColor: black,
  },
  recentRemoveText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    color: red,
    letterSpacing: 1,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: white,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRightWidth: gridLine,
    borderRightColor: black,
    borderBottomWidth: gridLine,
    borderBottomColor: black,
    backgroundColor: white,
  },
  chipActive: {
    backgroundColor: black,
  },
  chipText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 12,
    color: black,
    letterSpacing: 2,
  },
  chipActiveText: {
    color: white,
  },

  challengePanel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: white,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  challengeTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 16,
    color: black,
    letterSpacing: 0.3,
    lineHeight: 20,
    marginBottom: 5,
  },
  challengeBrief: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: '#555555',
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  challengeDone: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: red,
    lineHeight: 16,
    fontStyle: 'italic' as const,
  },
  challengeDays: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 14,
    color: '#AAAAAA',
    letterSpacing: 1,
    marginTop: 2,
  },

  consultBtn: {
    backgroundColor: red,
    paddingVertical: 18,
    alignItems: 'center',
  },
  consultBtnText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 14,
    color: white,
    letterSpacing: 4,
  },

  // Error
  errorPanel: {
    backgroundColor: white,
    padding: 16,
  },
  errorText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: black,
    marginBottom: 12,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: black,
    paddingVertical: 10,
    alignItems: 'center',
  },
  retryText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 12,
    color: white,
    letterSpacing: 3,
  },

  // Weather
  weatherTemp: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 44,
    color: white,
    lineHeight: 46,
    letterSpacing: -2,
  },
  weatherCity: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  weatherCondition: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 12,
    color: black,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  weatherHighLow: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: '#333333',
    letterSpacing: 1,
  },
  weatherWind: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 1,
    marginTop: 2,
  },
  logicPanel: {
    marginBottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: white,
  },

  // Verdict
  verdictPanel: {
    backgroundColor: white,
    padding: 16,
  },
  verdictVibe: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 12,
    color: red,
    letterSpacing: 3,
    marginBottom: 8,
  },
  verdictText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    color: black,
    lineHeight: 20,
  },

  // Look toggle
  lookToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  lookToggleText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    letterSpacing: 2.5,
  },

  // Outfit rows
  outfitCategory: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 2,
    marginBottom: 2,
  },
  outfitItem: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 14,
    color: black,
    letterSpacing: 0.5,
  },
  outfitDetail: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#444444',
    marginTop: 2,
    lineHeight: 16,
  },

  // Avoid
  avoidPanel: {
    backgroundColor: white,
    padding: 16,
  },
  avoidText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: black,
    flex: 1,
    lineHeight: 18,
  },

  // Cache badge
  cacheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: gridLine,
    borderBottomColor: black,
  },
  cacheBadgeText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 1,
  },
  cacheRefresh: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: black,
    letterSpacing: 0.5,
  },

  // Wear again
  wearAgainBanner: {
    borderLeftWidth: 4,
    borderLeftColor: red,
    paddingLeft: 12,
    paddingVertical: 10,
    paddingRight: 14,
    marginBottom: 0,
    backgroundColor: '#FFF0F0',
    borderBottomWidth: gridLine,
    borderBottomColor: black,
  },
  wearAgainLabel: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    letterSpacing: 2.5,
    color: red,
    marginBottom: 3,
  },
  wearAgainVibe: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 15,
    color: black,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  wearAgainText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#333333',
    lineHeight: 16,
  },
  wearAgainNote: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: '#333333',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // Share
  shareBtn: {
    backgroundColor: black,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 0,
  },
  shareBtnText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    color: yellow,
    letterSpacing: 3,
  },

  // Reset
  resetBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: white,
  },
  resetText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 12,
    color: '#555555',
    letterSpacing: 3,
  },

  // Magic moment
  magicOverlay: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  magicCard: {
    backgroundColor: white,
    borderWidth: gridLine,
    borderColor: black,
    padding: 28,
    marginHorizontal: 32,
    alignItems: 'center',
  },
  magicLabel: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    color: red,
    letterSpacing: 3,
    marginBottom: 12,
  },
  magicText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 22,
    color: black,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 30,
  },
});
