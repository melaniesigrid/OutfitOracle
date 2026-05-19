import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform,
  StatusBar, Animated, ScrollView, Image, Share, Dimensions,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppData } from '../contexts/AppContext';
import { HistoryEntry } from '../hooks/useOutfitHistory';
import { useCityPassport } from '../hooks/useCityPassport';
import { getClimatePersonality } from '../data/climatePersonalities';
import { PassportPageCard } from '../components/PassportPageCard';
import { useTempUnit } from '../contexts/TemperatureContext';
import { AppColors, AppFonts, ThemeName, isY2KTheme, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { STYLE_PASSPORT_LANDMARKS, getStylePassportLandmark } from '../data/fashionCapitals';

// ── Style landmarks shown as inspiration markers ──────────────────────────
const STYLE_LANDMARKS = STYLE_PASSPORT_LANDMARKS.map(c => ({
  city: c.name, country: c.country, latitude: c.lat, longitude: c.lon, featured: c.featured === true,
}));

const PASSPORT_MILESTONES = [
  { cities: 50, stamp: 'The Nomad Oracle' },
  { cities: 25, stamp: 'World Citizen'    },
  { cities: 10, stamp: 'Globetrotter'     },
];

interface CityPin {
  city:       string;
  country:    string;
  latitude:   number;
  longitude:  number;
  lastEntry:  HistoryEntry;
  visitCount: number;
}

function buildCityPins(history: HistoryEntry[]): CityPin[] {
  const map = new Map<string, CityPin>();
  // History is newest-first; iterate so the first occurrence is the newest
  for (const entry of history) {
    const { latitude, longitude } = entry.weather;
    if (latitude == null || longitude == null) continue;
    const key = entry.city.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        city:       entry.city,
        country:    entry.weather.country,
        latitude,
        longitude,
        lastEntry:  entry,
        visitCount: 1,
      });
    } else {
      map.get(key)!.visitCount++;
    }
  }
  return [...map.values()];
}

function getInitialRegion(pins: CityPin[]): Region {
  if (pins.length === 0) {
    return { latitude: 20, longitude: 10, latitudeDelta: 100, longitudeDelta: 120 };
  }
  const lats = pins.map(p => p.latitude);
  const lons = pins.map(p => p.longitude);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  return {
    latitude:       (minLat + maxLat) / 2,
    longitude:      (minLon + maxLon) / 2,
    latitudeDelta:  Math.max((maxLat - minLat) * 1.8, 12),
    longitudeDelta: Math.max((maxLon - minLon) * 1.8, 12),
  };
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

const WINDOW_W = Dimensions.get('window').width;

type MapRouteParams = { openCity?: string };

export function MapScreen() {
  const { colors, fonts, themeName } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts, themeName), [colors, fonts, themeName]);
  const navigation  = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, MapRouteParams>, string>>();
  const { historyCtx, archiveCtx } = useAppData();
  const { history } = historyCtx;
  const { formatTemp } = useTempUnit();

  const [selectedPin, setSelectedPin] = useState<CityPin | null>(null);
  const [sharing, setSharing] = useState(false);
  const passportCardRef = useRef<View>(null);
  const cardY = useRef(new Animated.Value(160)).current;

  const pins = useMemo(() => buildCityPins(history), [history]);
  const initialRegion = useMemo(() => getInitialRegion(pins), [pins]);

  const openCityParam = route.params?.openCity;
  const openCityHandledRef = useRef(false);
  React.useEffect(() => {
    if (!openCityParam || openCityHandledRef.current || pins.length === 0) return;
    const lower = openCityParam.toLowerCase();
    const match = pins.find(p => p.city.toLowerCase() === lower);
    if (match) {
      openCityHandledRef.current = true;
      selectPin(match);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCityParam, pins]);

  const visitedLandmarkNames = useMemo(
    () => new Set(
      pins
        .map(p => getStylePassportLandmark(p.city)?.name.toLowerCase())
        .filter((name): name is string => Boolean(name)),
    ),
    [pins],
  );

  const cityCount      = pins.length;
  const nextMilestone  = PASSPORT_MILESTONES.find(m => cityCount < m.cities);
  const earnedStamps   = PASSPORT_MILESTONES.filter(m => cityCount >= m.cities);

  const cityPassport = useCityPassport(
    selectedPin?.city ?? null,
    history,
    historyCtx.historyLoaded,
    archiveCtx.entries,
    archiveCtx.loaded,
  );

  const selectedCityEntries = useMemo(() => {
    if (!selectedPin) return [];
    const lower = selectedPin.city.toLowerCase();
    return history.filter(e => e.city.toLowerCase() === lower);
  }, [selectedPin, history]);

  const firstVisitTs = useMemo(
    () => selectedCityEntries.length ? Math.min(...selectedCityEntries.map(e => e.consultedAt)) : null,
    [selectedCityEntries],
  );

  const mostCommonVibe = useMemo(() => {
    if (!selectedCityEntries.length) return null;
    const freq = new Map<string, number>();
    for (const e of selectedCityEntries) freq.set(e.verdict.vibe, (freq.get(e.verdict.vibe) ?? 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [selectedCityEntries]);

  const archiveThumbs = useMemo(() => {
    if (!cityPassport?.archiveImages) return [];
    return cityPassport.archiveImages
      .map(imgs => imgs.day ?? imgs.night ?? imgs.daySketch ?? imgs.nightSketch ?? imgs.sketch)
      .filter((url): url is string => Boolean(url));
  }, [cityPassport?.archiveImages]);

  const handleShareCity = async () => {
    if (!passportCardRef.current || !selectedPin) return;
    setSharing(true);
    try {
      const uri = await captureRef(passportCardRef, { format: 'png', quality: 1 });
      await Share.share({ url: uri });
    } catch {}
    setSharing(false);
  };

  function selectPin(pin: CityPin) {
    setSelectedPin(pin);
    Animated.spring(cardY, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }).start();
  }

  function clearPin() {
    Animated.timing(cardY, { toValue: 160, duration: 200, useNativeDriver: true }).start(() =>
      setSelectedPin(null),
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── MAP ── */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapType="mutedStandard"
        initialRegion={initialRegion}
        showsUserLocation
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        onPress={() => selectedPin && clearPin()}
      >
        {/* Style landmark inspiration markers */}
        {STYLE_LANDMARKS.filter(fc => !visitedLandmarkNames.has(fc.city.toLowerCase())).map(fc => (
          <Marker
            key={`landmark-${fc.city}`}
            coordinate={{ latitude: fc.latitude, longitude: fc.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            title={fc.city}
            description={fc.country}
          >
            <View style={styles.inspirationMarker}>
              <View style={[styles.inspirationRing, fc.featured && styles.inspirationRingFeatured]} />
              {fc.featured && <Text style={styles.inspirationLabel}>{fc.city}</Text>}
            </View>
          </Marker>
        ))}

        {/* Visited city markers */}
        {pins.map(pin => (
          <Marker
            key={`pin-${pin.city}`}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            onPress={() => selectPin(pin)}
          >
            <View style={[
              styles.visitedMarker,
              selectedPin?.city === pin.city && styles.visitedMarkerSelected,
            ]}>
              <View style={styles.visitedDot} />
              {pin.visitCount > 1 && (
                <View style={styles.visitCount}>
                  <Text style={styles.visitCountText}>{pin.visitCount}</Text>
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {pins.length === 0 && (
        <View
          style={styles.emptyHero}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.emptyHeroKicker}>STYLE PASSPORT</Text>
          <Text style={styles.emptyHeroTitle}>The map is waiting for its first pin.</Text>
          <Text style={styles.emptyHeroBody}>
            Consult the Oracle in any city and your journey will begin here.
          </Text>
        </View>
      )}

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#FAF9F6" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>STYLE PASSPORT</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeNum}>{cityCount}</Text>
          <Text style={styles.countBadgeLabel}>{cityCount === 1 ? 'city' : 'cities'}</Text>
        </View>
      </View>

      {/* ── LEGEND ── */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotVisited]} />
          <Text style={styles.legendText}>Visited</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotCapital]} />
          <Text style={styles.legendText}>Style landmark</Text>
        </View>
      </View>

      {/* ── BOTTOM PANEL ── */}
      {selectedPin ? (
        /* City Dossier Sheet */
        <Animated.View style={[styles.panel, styles.dossierPanel, { transform: [{ translateY: cardY }] }]}>
          <Pressable
            style={styles.panelClose}
            onPress={clearPin}
            accessibilityRole="button"
            accessibilityLabel="Close city detail"
          >
            <MaterialCommunityIcons name="close" size={16} color="rgba(250,249,246,0.40)" />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.dossierScroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── City header ── */}
            <View style={styles.dossierHeader}>
              <View style={styles.dossierHeaderLeft}>
                <Text style={styles.cityCardName}>{selectedPin.city}</Text>
                <View style={styles.dossierMeta}>
                  <Text style={styles.cityCardCountry}>{selectedPin.country}</Text>
                  {cityPassport?.isFashionCapital && (
                    <View style={styles.capitalBadge}>
                      <Text style={styles.capitalBadgeText}>STYLE LANDMARK</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.cityCardRight}>
                <Text style={styles.cityCardTemp}>{selectedPin.lastEntry.weather.temp}°</Text>
                <MaterialCommunityIcons
                  name={selectedPin.lastEntry.weather.conditionIcon as any}
                  size={20}
                  color="rgba(250,249,246,0.50)"
                />
              </View>
            </View>

            <View style={styles.dossierRule} />

            {/* ── Fashion Territory ── */}
            {cityPassport?.descriptor ? (
              <View style={styles.dossierSection}>
                <Text style={styles.dossierLabel}>FASHION TERRITORY</Text>
                <Text style={styles.dossierDescriptor}>{cityPassport.descriptor}</Text>
              </View>
            ) : null}

            {/* ── Climate Personality ── */}
            <View style={styles.dossierSection}>
              <Text style={styles.dossierLabel}>CLIMATE PERSONALITY</Text>
              <Text style={styles.dossierClimate}>
                {getClimatePersonality(
                  selectedPin.lastEntry.weather.humidity,
                  selectedPin.lastEntry.weather.windSpeed,
                )}
              </Text>
            </View>

            {/* ── Your History ── */}
            <View style={styles.dossierSection}>
              <Text style={styles.dossierLabel}>YOUR HISTORY</Text>
              <View style={styles.dossierHistoryRow}>
                <View style={styles.dossierHistoryStat}>
                  <Text style={styles.dossierHistoryNum}>{selectedPin.visitCount}</Text>
                  <Text style={styles.dossierHistoryUnit}>
                    {selectedPin.visitCount === 1 ? 'CONSULT' : 'CONSULTS'}
                  </Text>
                </View>
                {firstVisitTs && (
                  <View style={styles.dossierHistoryStat}>
                    <Text style={styles.dossierHistoryNum}>
                      {new Date(firstVisitTs).toLocaleDateString([], { month: 'short', year: '2-digit' }).toUpperCase()}
                    </Text>
                    <Text style={styles.dossierHistoryUnit}>FIRST VISIT</Text>
                  </View>
                )}
                {mostCommonVibe && (
                  <View style={[styles.dossierHistoryStat, { flex: 1 }]}>
                    <Text style={[styles.dossierHistoryNum, styles.dossierHistoryVibe]} numberOfLines={1}>
                      {mostCommonVibe}
                    </Text>
                    <Text style={styles.dossierHistoryUnit}>SIGNATURE VIBE</Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Archive thumbnails ── */}
            {archiveThumbs.length > 0 && (
              <View style={styles.dossierSection}>
                <Text style={styles.dossierLabel}>FROM YOUR ARCHIVE</Text>
                <View style={styles.thumbGrid}>
                  {archiveThumbs.map((url, i) => (
                    <Image key={i} source={{ uri: url }} style={styles.thumb} resizeMode="cover" />
                  ))}
                </View>
              </View>
            )}

            {/* ── Share button ── */}
            <Pressable
              style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
              onPress={handleShareCity}
              disabled={sharing}
              accessibilityRole="button"
              accessibilityLabel={`Share ${selectedPin.city} passport page`}
            >
              <Text style={styles.shareBtnText}>
                {sharing ? 'CAPTURING...' : 'SHARE THIS CITY →'}
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      ) : (
        /* Passport stats panel */
        <View style={styles.panel}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <View style={styles.statBlock}>
              <Text style={styles.statNum}>{cityCount}</Text>
              <Text style={styles.statLabel}>{cityCount === 1 ? 'CITY' : 'CITIES'}</Text>
            </View>

            {nextMilestone && (
              <View style={styles.statBlock}>
                <Text style={styles.statNum}>{nextMilestone.cities - cityCount}</Text>
                <Text style={styles.statLabel}>UNTIL "{nextMilestone.stamp.toUpperCase()}"</Text>
              </View>
            )}

            {earnedStamps.map(stamp => (
              <View key={stamp.stamp} style={styles.stamp}>
                <MaterialCommunityIcons name="passport" size={12} color={colors.scarlet} />
                <Text style={styles.stampText}>{stamp.stamp.toUpperCase()}</Text>
              </View>
            ))}

            {pins.length === 0 && (
              <Text style={styles.emptyHint}>
                Consult the Oracle in a city to place your first pin.
              </Text>
            )}
          </ScrollView>
        </View>
      )}
      {/* Offscreen PassportPageCard for share capture */}
      {selectedPin && (
        <View style={{ position: 'absolute', left: WINDOW_W + 10, top: 0 }} pointerEvents="none">
          <PassportPageCard
            ref={passportCardRef}
            city={selectedPin.city}
            country={selectedPin.country}
            vibe={selectedPin.lastEntry.verdict.vibe}
            visitCount={selectedPin.visitCount}
            descriptor={cityPassport?.descriptor ?? null}
            tempLabel={formatTemp(selectedPin.lastEntry.weather.temp)}
            conditionLabel={selectedPin.lastEntry.weather.conditionLabel}
            consultedAt={selectedPin.lastEntry.consultedAt}
          />
        </View>
      )}
    </View>
  );
}

const HEADER_TOP = Platform.OS === 'ios' ? 56 : 40;

function makeStyles(colors: AppColors, fonts: AppFonts, themeName: ThemeName) {
  const isY2K = isY2KTheme(themeName);

  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },

  /* ── Header ── */
  header: {
    position: 'absolute',
    top: HEADER_TOP,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(13,11,8,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    backgroundColor: 'rgba(13,11,8,0.75)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  headerLabel: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2.5,
    color: 'rgba(250,249,246,0.70)',
  },
  countBadge: {
    backgroundColor: colors.scarlet,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 44,
  },
  countBadgeNum: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#FAF9F6',
    lineHeight: isY2K ? 27 : 20,
  },
  countBadgeLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.75)',
    letterSpacing: 1,
  },

  /* ── Legend ── */
  legend: {
    position: 'absolute',
    top: HEADER_TOP + 52,
    left: spacing.lg,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13,11,8,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotVisited: {
    backgroundColor: colors.scarlet,
  },
  legendDotCapital: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(250,249,246,0.40)',
  },
  legendText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.55)',
    letterSpacing: 0.5,
  },

  /* ── Markers ── */
  visitedMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.scarlet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  visitedMarkerSelected: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FAF9F6',
  },
  visitedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FAF9F6',
  },
  visitCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitCountText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: '#FAF9F6',
  },
  inspirationMarker: {
    alignItems: 'center',
    gap: 3,
  },
  inspirationRing: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.32)',
    backgroundColor: 'rgba(13,11,8,0.30)',
  },
  inspirationRingFeatured: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(250,249,246,0.50)',
  },
  inspirationLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(30,30,30,0.65)',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(250,249,246,0.70)',
    paddingHorizontal: 3,
    paddingVertical: 1,
  },

  emptyHero: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '34%',
    backgroundColor: 'rgba(13,11,8,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.10)',
    padding: spacing.lg,
  },
  emptyHeroKicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2.5,
    color: 'rgba(250,249,246,0.42)',
    marginBottom: spacing.sm,
  },
  emptyHeroTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: isY2K ? 46 : 38,
    color: '#FAF9F6',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  emptyHeroBody: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(250,249,246,0.48)',
    letterSpacing: 0.3,
  },

  /* ── Bottom panel ── */
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13,11,8,0.92)',
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(250,249,246,0.08)',
  },
  panelClose: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    padding: 4,
  },

  /* City detail card */
  cityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  cityCardLeft: {
    flex: 1,
  },
  cityCardName: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: '#FAF9F6',
    letterSpacing: -0.5,
    lineHeight: isY2K ? 44 : 36,
  },
  cityCardCountry: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.40)',
    letterSpacing: 1,
    marginTop: 2,
  },
  cityCardVibe: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.scarlet,
    letterSpacing: 1,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  cityCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cityCardTemp: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: '#FAF9F6',
    lineHeight: isY2K ? 38 : 32,
  },
  cityCardDate: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.30)',
    letterSpacing: 0.5,
  },
  cityCardVisits: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.30)',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },

  /* ── City Dossier Sheet ── */
  dossierPanel: {
    maxHeight: Math.min(Dimensions.get('window').height * 0.72, 500),
  },
  dossierScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
    gap: 0,
  },
  dossierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingRight: 28,
  },
  dossierHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  dossierMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  capitalBadge: {
    borderWidth: 1,
    borderColor: '#C4943A',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  capitalBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#C4943A',
  },
  dossierRule: {
    height: 1,
    backgroundColor: 'rgba(250,249,246,0.08)',
    marginVertical: spacing.md,
  },
  dossierSection: {
    marginBottom: spacing.md,
    gap: 6,
  },
  dossierLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(250,249,246,0.30)',
  },
  dossierDescriptor: {
    fontFamily: fonts.serif ?? fonts.display,
    fontSize: 15,
    fontStyle: 'italic',
    color: 'rgba(250,249,246,0.75)',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  dossierClimate: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: 'rgba(250,249,246,0.60)',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  dossierHistoryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  dossierHistoryStat: {
    gap: 2,
  },
  dossierHistoryNum: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#FAF9F6',
    lineHeight: isY2K ? 28 : 24,
    letterSpacing: -0.3,
  },
  dossierHistoryVibe: {
    fontSize: 16,
    color: colors.scarlet,
    letterSpacing: 0,
  },
  dossierHistoryUnit: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: 'rgba(250,249,246,0.30)',
    letterSpacing: 1.5,
  },
  thumbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  thumb: {
    width: (Dimensions.get('window').width - spacing.lg * 2 - 4) / 2,
    height: 90,
    backgroundColor: 'rgba(250,249,246,0.06)',
  },
  shareBtn: {
    marginTop: 4,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.15)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareBtnDisabled: {
    opacity: 0.4,
  },
  shareBtnText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(250,249,246,0.50)',
  },

  /* Passport stats */
  statsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  statBlock: {
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(250,249,246,0.10)',
    paddingRight: spacing.lg,
  },
  statNum: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    color: '#FAF9F6',
    lineHeight: isY2K ? 48 : 40,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.35)',
    letterSpacing: 1.5,
    marginTop: 2,
    textAlign: 'center',
  },
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.scarlet,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  stampText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.scarlet,
    letterSpacing: 1,
  },
  emptyHint: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: 'rgba(250,249,246,0.30)',
    letterSpacing: 0.3,
    lineHeight: 16,
    maxWidth: 240,
  },
  });
}
