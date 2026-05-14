import React, { useRef, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Platform, StatusBar, Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppData } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTempUnit } from '../../contexts/TemperatureContext';
import { y2kTokens, spacing } from '../../theme';
import { getY2KTypography, Y2KTypography } from '../../theme/y2kTypography';
import { HourlyGraph } from '../../components/HourlyGraph';
import { Y2KCard } from '../../components/y2k/Y2KCard';
import { Y2KBadge } from '../../components/y2k/Y2KBadge';
import { Y2KSticker } from '../../components/y2k/Y2KSticker';
import { Y2KSignature } from '../../components/y2k/Y2KSignature';

// ─── Word of the Day (same deterministic list) ────────────────────────────────

const WORDS = [
  { word: 'Sartorial',    origin: 'Latin · sartōrius',  definition: 'Relating to tailoring or the making of fine garments.' },
  { word: 'Sprezzatura',  origin: 'Italian',             definition: 'The art of making the difficult look effortless; studied carelessness.' },
  { word: 'Insouciant',   origin: 'French · insoucier', definition: 'Showing a casual lack of concern; blithely indifferent.' },
  { word: 'Louche',       origin: 'French',              definition: 'Disreputable or rakish in an intriguing, appealing way.' },
  { word: 'Élan',         origin: 'French',              definition: 'Energy, style, and flair; vivacious enthusiasm.' },
  { word: 'Panache',      origin: 'French · pennacchio', definition: 'A flamboyant confidence of style or manner.' },
  { word: 'Diaphanous',   origin: 'Greek · diaphanēs',  definition: 'Light, delicate, and translucent; sheer as gossamer.' },
  { word: 'Bespoke',      origin: 'Old English',        definition: 'Made to order; custom-crafted to exact specification.' },
  { word: 'Nonchalant',   origin: 'French · nonchaloir',definition: 'Appearing casually calm and unconcerned; coolly self-assured.' },
  { word: 'Opulent',      origin: 'Latin · opulentus',  definition: 'Ostentatiously rich; richly luxurious and sumptuous.' },
  { word: 'Avant-garde',  origin: 'French',              definition: 'Favouring experimental, ahead-of-its-time ideas.' },
  { word: 'Gestalt',      origin: 'German · shape',     definition: 'The overall look perceived as a unified whole, beyond its parts.' },
  { word: 'Zeitgeist',    origin: 'German',              definition: 'The defining spirit or mood of a particular era.' },
  { word: 'Couture',      origin: 'French · coudre',    definition: 'The design and manufacture of fashionable garments; high fashion.' },
  { word: 'Capsule',      origin: 'Latin · capsula',    definition: 'A small, curated collection of versatile, timeless pieces.' },
  { word: 'Silhouette',   origin: 'French',              definition: 'The outline or shape of a garment against the body.' },
  { word: 'Atelier',      origin: 'French',              definition: 'A designer\'s private workshop; a studio of haute couture.' },
  { word: 'Eclecticism',  origin: 'Greek · eklektikos', definition: 'Deriving ideas from a broad and varied range of sources.' },
  { word: 'Burnished',    origin: 'Old French · brunir', definition: 'Polished by rubbing; having a warm, metallic sheen.' },
  { word: 'Draped',       origin: 'Old French · draper', definition: 'Arranged in graceful, flowing folds; fabric allowed to fall freely.' },
  { word: 'Minimal',      origin: 'Latin · minimus',    definition: 'Reduced to essentials; beauty found in what is left out.' },
  { word: 'Chromatic',    origin: 'Greek · khroma',     definition: 'Relating to colour; richly hued; vibrant with pigment.' },
  { word: 'Understated',  origin: 'English',             definition: 'Expressed with restraint; achieving impact through quiet confidence.' },
];

function dayOfYear(): number {
  const now = new Date();
  return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
}

function uvLabel(uv: number) {
  if (uv <= 2) return 'LOW';
  if (uv <= 5) return 'MODERATE';
  if (uv <= 7) return 'HIGH';
  if (uv <= 10) return 'VERY HIGH';
  return 'EXTREME';
}
function uvColor(uv: number) {
  if (uv <= 2) return '#5CB85C';
  if (uv <= 5) return '#F0C040';
  if (uv <= 7) return '#F08030';
  if (uv <= 10) return '#D84040';
  return '#B040D0';
}
function pollenLevel(val: number) {
  if (val === 0) return 'NONE';
  if (val <= 10) return 'LOW';
  if (val <= 50) return 'MOD';
  if (val <= 200) return 'HIGH';
  return 'V HIGH';
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ left, right, typo }: { left: string; right?: string; typo: Y2KTypography }) {
  return (
    <View style={sLabel.wrap}>
      <View style={sLabel.rule} />
      <View style={sLabel.row}>
        <Text style={[sLabel.left, { fontFamily: typo.monoLabel.fontFamily }]}>{left}</Text>
        {right ? <Text style={[sLabel.right, { fontFamily: typo.monoData.fontFamily }]}>{right}</Text> : null}
      </View>
      <View style={sLabel.rule} />
    </View>
  );
}
const sLabel = {
  wrap: { marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  rule: { height: 1, backgroundColor: y2kTokens.deepPurple, opacity: 0.35 },
  row:  { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingVertical: 5 },
  left: { fontSize: 10, letterSpacing: 2, color: y2kTokens.mutedPurple },
  right: { fontSize: 10, letterSpacing: 1.5, color: y2kTokens.hotPink },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export function Y2KTodayScreen() {
  const navigation = useNavigation<any>();
  const { oracle, profileCtx, streakCtx } = useAppData();
  const { weather, verdict, cachedAt, cachedCity, status } = oracle;
  const profile  = profileCtx.profile;
  const { streak, rankTitle } = streakCtx;

  const { y2kFontSubtheme } = useTheme();
  const { formatTemp, unit } = useTempUnit();
  const typo   = useMemo(() => getY2KTypography(y2kFontSubtheme), [y2kFontSubtheme]);
  const styles = useMemo(() => makeStyles(typo), [typo]);

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY       = useRef(new Animated.Value(16)).current;

  useFocusEffect(
    useCallback(() => {
      heroOpacity.setValue(0);
      heroY.setValue(16);
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroY,       { toValue: 0, duration: 450, useNativeDriver: true }),
      ]).start();
    }, [heroOpacity, heroY]),
  );

  const showResult = !!weather && !!verdict;
  const isLoading  = status === 'fetching-weather' || status === 'fetching-verdict';
  const hoursAgo   = cachedAt ? Math.round((Date.now() - cachedAt) / 3600000) : null;
  const word       = WORDS[dayOfYear() % WORDS.length];
  const today      = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={y2kTokens.deepPurple} />

      {/* ── HEADER ── deep purple block for contrast with lavender scroll */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.wordmark}>outfit oracle</Text>
            {streak > 0 && (
              <Text style={styles.streakLabel}>{streak} days · {(rankTitle ?? '').toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Y2KSticker type="sparkle" size={13} color={y2kTokens.lime} />
            <Y2KSticker type="filledHeart" size={13} color={y2kTokens.hotPink} />
            {cachedCity ? (
              <View style={styles.cityChip}>
                <Text style={styles.cityChipText}>{cachedCity}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Text style={styles.headerDate}>{today}</Text>
        <View style={styles.headerBottomRule} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── WORD OF THE DAY ── */}
        <SectionLabel left="WORD OF THE DAY" right="// LEXICON ♡" typo={typo} />
        <View style={styles.section}>
          <Y2KCard shadow>
            <View style={styles.cardPad}>
              <View style={styles.fileHeader}>
                <Text style={styles.fileLeft}>// DEFINED</Text>
                <Text style={styles.fileRight}>vocab · {dayOfYear() % WORDS.length + 1}/{WORDS.length}</Text>
              </View>
              <View style={styles.thinRule} />
              <Text style={styles.wotdWord}>{word.word}</Text>
              <Text style={styles.wotdOrigin}>{word.origin}</Text>
              <Text style={styles.wotdDef}>{word.definition}</Text>
            </View>
          </Y2KCard>
        </View>

        {showResult ? (
          <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroY }] }}>

            {/* ── WEATHER HERO ── */}
            <SectionLabel left="FOR THE RECORD ♡" right="// ON FILE" typo={typo} />
            <View style={styles.section}>
              <Y2KCard shadow>
                {/* Cream header: city + condition */}
                <View style={styles.cardPad}>
                  <View style={styles.weatherTop}>
                    <View style={styles.weatherLeft}>
                      <Text style={styles.heroCity}>{weather.city}, {weather.country}</Text>
                      <Text style={styles.heroCondition}>{weather.conditionLabel.toUpperCase()}</Text>
                    </View>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name={weather.conditionIcon as any}
                        size={30}
                        color={y2kTokens.cream}
                      />
                    </View>
                  </View>
                </View>

                {/* Deep purple temperature block */}
                <View style={styles.tempBlock}>
                  <Text style={styles.heroTemp}>{formatTemp(weather.temp)}°</Text>
                  <Text style={styles.heroMeta}>
                    {'feels ' + formatTemp(weather.feelsLike) + '°  ·  ' + weather.humidity + '% humidity  ·  ' + weather.windSpeed + ' km/h'}
                  </Text>
                </View>

                {/* Stat chips — cream section below */}
                <View style={styles.statChips}>
                  <View style={styles.statChip}>
                    <Text style={styles.statChipLabel}>FEELS</Text>
                    <Text style={styles.statChipVal}>{formatTemp(weather.feelsLike)}°</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Text style={styles.statChipLabel}>HUMIDITY</Text>
                    <Text style={styles.statChipVal}>{weather.humidity}%</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Text style={styles.statChipLabel}>WIND</Text>
                    <Text style={styles.statChipVal}>{weather.windSpeed}<Text style={styles.statChipUnit}> km/h</Text></Text>
                  </View>
                </View>
              </Y2KCard>
            </View>

            {/* ── HOURLY FORECAST ── */}
            {!!weather.hourly?.length && (
              <>
                <SectionLabel left="NEXT 24 HOURS" right="// HOURLY ♡" typo={typo} />
                <View style={[styles.section, styles.graphCard]}>
                  <Y2KCard shadow>
                    <View style={styles.graphPad}>
                      <HourlyGraph
                        hours={weather.hourly}
                        accentColor={y2kTokens.hotPink}
                        textHigh={y2kTokens.deepPurple}
                        textFaint={y2kTokens.mutedPurple}
                        lineColor={y2kTokens.hotPink + 'AA'}
                        iconColor={y2kTokens.mutedPurple}
                        monoFont={typo.monoData.fontFamily}
                        formatTemp={formatTemp}
                        dotColor={y2kTokens.hotPink}
                        dotRadius={3}
                      />
                    </View>
                  </Y2KCard>
                </View>
              </>
            )}

            {/* ── THE ORACLE SPEAKS ── */}
            <SectionLabel left="// THE ORACLE SPEAKS" right="THE DECREE ♡" typo={typo} />
            <View style={styles.section}>
              <Y2KCard shadow>
                <View style={styles.cardPad}>
                  {/* Sticker accents */}
                  <View style={styles.stickerTop}>
                    <Y2KSticker type="sparkle" size={12} color={y2kTokens.hotPink} />
                    <Y2KSticker type="diamond" size={10} color={y2kTokens.mutedPurple} />
                  </View>

                  <Text style={styles.vibeHeadline}>{verdict.vibe.toLowerCase()}</Text>
                  <View style={styles.hotPinkRule} />
                  <Text style={styles.verdictPull}>"{verdict.verdict}"</Text>

                  {/* Rating + signature row */}
                  <View style={styles.verdictFooter}>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingLabel}>EFFORT</Text>
                      <View style={styles.pips}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <View
                            key={i}
                            style={[styles.pip, i < verdict.rating ? styles.pipFilled : styles.pipEmpty]}
                          />
                        ))}
                      </View>
                      <Text style={styles.ratingNum}>{verdict.rating}/5</Text>
                    </View>
                    <Y2KSignature
                      text="xoxo, the oracle ♡"
                      color={y2kTokens.mutedPurple}
                      style={styles.sig}
                    />
                  </View>
                </View>
              </Y2KCard>
            </View>

            {/* ── TODAY'S LOOK ── */}
            <SectionLabel left="TODAY'S LOOK" right={`OUTFIT ${verdict.outfits.length} PIECES`} typo={typo} />
            <View style={styles.section}>
              <Y2KCard shadow>
                <View style={styles.cardPad}>
                  <View style={styles.fileHeader}>
                    <Text style={styles.fileLeft}>// WHAT TO WEAR</Text>
                    <Y2KBadge label="DAYTIME" variant="hotpink" />
                  </View>
                  <View style={styles.thinRule} />
                  {verdict.outfits.map((item, i) => (
                    <View
                      key={item.category}
                      style={[styles.outfitRow, i < verdict.outfits.length - 1 && styles.outfitRowBorder]}
                    >
                      <Text style={styles.outfitPiece}>PIECE {String(i + 1).padStart(2, '0')}</Text>
                      <View style={styles.outfitRight}>
                        <Text style={styles.outfitCat}>{item.category.toUpperCase()}</Text>
                        <Text style={styles.outfitItem}>{item.item}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Y2KCard>
            </View>

            {/* ── WEEKLY FORECAST ── */}
            {!!weather.daily?.length && (
              <>
                <SectionLabel left="WEEKLY FORECAST" right="// 7 DAYS ♡" typo={typo} />
                <View style={styles.section}>
                  <Y2KCard shadow>
                    <View style={styles.cardPad}>
                      {weather.daily.map((d, i) => (
                        <View
                          key={d.date}
                          style={[styles.dailyRow, i < weather.daily!.length - 1 && styles.dailyRowBorder]}
                        >
                          <Text style={styles.dailyDay}>{d.dayLabel}</Text>
                          <MaterialCommunityIcons
                            name={d.conditionIcon as any}
                            size={16}
                            color={y2kTokens.mutedPurple}
                            style={styles.dailyIcon}
                          />
                          <Text style={styles.dailyCond} numberOfLines={1}>{d.conditionLabel}</Text>
                          {d.precipProb > 0 ? (
                            <Text style={styles.dailyPrecip}>{d.precipProb}%</Text>
                          ) : (
                            <Text style={styles.dailyPrecipEmpty}>—</Text>
                          )}
                          <View style={styles.dailyTemps}>
                            <Text style={styles.dailyMax}>{formatTemp(d.tempMax)}°</Text>
                            <Text style={styles.dailyMin}>{formatTemp(d.tempMin)}°</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </Y2KCard>
                </View>
              </>
            )}

            {/* ── CONDITIONS ── */}
            {(weather.uvIndex !== undefined || weather.sunrise || weather.moonPhaseName) && (
              <>
                <SectionLabel left="CONDITIONS" right="// UV · SUN · MOON ♡" typo={typo} />
                <View style={styles.section}>
                  <Y2KCard shadow>
                    <View style={styles.conditionsGrid}>
                      {weather.uvIndex !== undefined && (
                        <View style={styles.condItem}>
                          <MaterialCommunityIcons name="white-balance-sunny" size={20} color={uvColor(weather.uvIndex)} />
                          <Text style={[styles.condVal, { color: uvColor(weather.uvIndex) }]}>{weather.uvIndex}</Text>
                          <Text style={styles.condLabel}>UV · {uvLabel(weather.uvIndex)}</Text>
                        </View>
                      )}
                      {weather.sunrise && (
                        <View style={styles.condItem}>
                          <MaterialCommunityIcons name="weather-sunset-up" size={20} color={y2kTokens.mutedPurple} />
                          <Text style={styles.condVal}>{weather.sunrise}</Text>
                          <Text style={styles.condLabel}>SUNRISE</Text>
                        </View>
                      )}
                      {weather.sunset && (
                        <View style={styles.condItem}>
                          <MaterialCommunityIcons name="weather-sunset-down" size={20} color={y2kTokens.mutedPurple} />
                          <Text style={styles.condVal}>{weather.sunset}</Text>
                          <Text style={styles.condLabel}>SUNSET</Text>
                        </View>
                      )}
                      {weather.moonPhaseName && (
                        <View style={styles.condItem}>
                          <MaterialCommunityIcons
                            name={(weather.moonPhaseIcon ?? 'moon-full') as any}
                            size={20}
                            color={y2kTokens.mutedPurple}
                          />
                          <Text style={styles.condLabel}>{weather.moonPhaseName.toUpperCase()}</Text>
                        </View>
                      )}
                    </View>
                  </Y2KCard>
                </View>
              </>
            )}

            {/* ── ALLERGENS ── */}
            {weather.pollen && (
              <>
                <SectionLabel left="ALLERGENS & AIR" right="// ON FILE ♡" typo={typo} />
                <View style={styles.section}>
                  <Y2KCard shadow>
                    <View style={styles.cardPad}>
                      <View style={styles.aqiRow}>
                        <MaterialCommunityIcons name="bee" size={22} color={y2kTokens.hotPink} />
                        <Text style={styles.aqiVal}>{weather.pollen.aqi}</Text>
                        <Text style={styles.aqiLabel}>AQI · {weather.pollen.aqiLabel.toUpperCase()}</Text>
                      </View>
                      <View style={styles.thinRule} />
                      <View style={styles.pollenRow}>
                        {[
                          { label: 'GRASS',   val: weather.pollen.grass,   icon: 'grass' as const },
                          { label: 'BIRCH',   val: weather.pollen.birch,   icon: 'leaf-maple' as const },
                          { label: 'RAGWEED', val: weather.pollen.ragweed, icon: 'flower-pollen' as const },
                        ].map(p => (
                          <View key={p.label} style={styles.pollenItem}>
                            <MaterialCommunityIcons name={p.icon} size={14} color={y2kTokens.mutedPurple} />
                            <Text style={styles.pollenVal}>{p.val}</Text>
                            <Text style={styles.pollenSub}>{pollenLevel(p.val)}</Text>
                            <Text style={styles.pollenType}>{p.label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </Y2KCard>
                </View>
              </>
            )}

            {/* ── REFRESH ROW ── */}
            <View style={styles.refreshRow}>
              {hoursAgo !== null && (
                <Text style={styles.refreshMeta}>
                  {hoursAgo === 0 ? 'just now' : `${hoursAgo}h ago`} · {cachedCity}
                </Text>
              )}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (cachedCity) oracle.consult(cachedCity, 'Women', profile);
                }}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Refresh today's Oracle verdict"
              >
                <Text style={[styles.refreshBtn, isLoading && { opacity: 0.4 }]}>
                  {isLoading ? 'consulting…' : '+ refresh verdict ♡'}
                </Text>
              </Pressable>
            </View>

          </Animated.View>
        ) : (

          /* ── EMPTY STATE ── */
          <View style={styles.emptyState}>
            <Y2KCard shadow style={styles.emptyCard}>
              <View style={styles.emptyCardInner}>
                <Y2KSticker type="sparkle" size={28} color={y2kTokens.hotPink} style={styles.emptyIcon} />
                <View style={styles.emptyRule} />
                <Text style={styles.emptyTitle}>The Oracle awaits.</Text>
                <Text style={styles.emptySub}>Enter your city in the Oracle tab{'\n'}to receive today's verdict.</Text>
                <View style={styles.emptyRule} />
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Oracle'); }}
                  accessibilityRole="button"
                  accessibilityLabel="Go to Oracle tab"
                >
                  <Text style={styles.emptyBtnText}>CONSULT THE ORACLE ♡</Text>
                </Pressable>
                <Y2KSignature text="ready when you are ♡" color={y2kTokens.mutedPurple} style={styles.emptySig} />
              </View>
            </Y2KCard>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(typo: Y2KTypography) { return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: y2kTokens.lavenderBg,
  },

  // Header — deep purple block
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: y2kTokens.deepPurple,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  wordmark: {
    fontFamily: typo.displayMicro.fontFamily,
    fontSize: 15,
    letterSpacing: typo.displayMicro.letterSpacing,
    color: y2kTokens.cream,
  },
  streakLabel: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    letterSpacing: 1.5,
    color: y2kTokens.hotPink,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: y2kTokens.lavenderBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 4,
  },
  cityChipText: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.lavenderBg,
    letterSpacing: 1,
  },
  headerDate: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    letterSpacing: 1,
    color: y2kTokens.lavenderBg,
    opacity: 0.6,
    marginBottom: spacing.sm,
  },
  headerBottomRule: {
    height: 2,
    backgroundColor: y2kTokens.lime,
  },

  // Scroll
  scroll: { flex: 1 },
  content: { paddingTop: spacing.lg, paddingBottom: 60 },

  // Section wrappers
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionNoPad: {
    marginBottom: spacing.lg,
  },

  // Card interior
  cardPad: {
    padding: spacing.md,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fileLeft: {
    fontFamily: typo.monoLabel.fontFamily,
    fontSize: 10,
    letterSpacing: 2,
    color: y2kTokens.mutedPurple,
  },
  fileRight: {
    fontFamily: typo.monoData.fontFamily,
    fontSize: 9,
    letterSpacing: 1,
    color: y2kTokens.hotPink,
  },
  thinRule: {
    height: 1,
    backgroundColor: y2kTokens.deepPurple,
    marginVertical: spacing.sm,
    opacity: 0.5,
  },
  hotPinkRule: {
    height: 1,
    backgroundColor: y2kTokens.hotPink,
    marginVertical: spacing.sm,
  },

  // Word of the Day
  wotdWord: {
    fontFamily: typo.displayMedium.fontFamily,
    fontSize: 32,
    color: y2kTokens.deepPurple,
    letterSpacing: typo.displayMedium.letterSpacing,
    lineHeight: 36,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  wotdOrigin: {
    fontFamily: typo.monoLabel.fontFamily,
    fontSize: 10,
    color: y2kTokens.hotPink,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  wotdDef: {
    fontFamily: typo.editorialSmall.fontFamily,
    fontSize: 15,
    color: y2kTokens.mutedPurple,
    lineHeight: 22,
  },

  // Weather hero
  weatherTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weatherLeft: { flex: 1 },
  heroCity: {
    fontFamily: typo.displaySmall.fontFamily,
    fontSize: 20,
    color: y2kTokens.ink,
    letterSpacing: typo.displaySmall.letterSpacing,
    lineHeight: 24,
  },
  heroCondition: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.mutedPurple,
    letterSpacing: 2,
    marginTop: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: y2kTokens.deepPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Deep purple temperature block
  tempBlock: {
    backgroundColor: y2kTokens.deepPurple,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  heroTemp: {
    fontFamily: typo.displayHero.fontFamily,
    fontSize: 96,
    color: y2kTokens.lime,
    lineHeight: 112,
    letterSpacing: typo.displayHero.letterSpacing,
  },
  heroMeta: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.cream,
    letterSpacing: 1,
    marginTop: 6,
    opacity: 0.7,
  },
  statChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  statChip: {
    flex: 1,
    backgroundColor: y2kTokens.blush,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: y2kTokens.hotPink + '40',
    padding: spacing.sm,
    alignItems: 'center',
  },
  statChipLabel: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 8,
    color: y2kTokens.hotPink,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  statChipVal: {
    fontFamily: typo.displaySmall.fontFamily,
    fontSize: 16,
    color: y2kTokens.deepPurple,
    letterSpacing: typo.displaySmall.letterSpacing,
  },
  statChipUnit: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.mutedPurple,
  },


  // Oracle speaks
  stickerTop: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: 4,
    zIndex: 1,
  },
  vibeHeadline: {
    fontFamily: typo.displayLarge.fontFamily,
    fontSize: 40,
    color: y2kTokens.hotPink,
    lineHeight: 44,
    letterSpacing: typo.displayLarge.letterSpacing,
    marginBottom: 4,
  },
  verdictPull: {
    fontFamily: typo.editorialItalic.fontFamily,
    fontSize: 20,
    color: y2kTokens.ink,
    lineHeight: 30,
    letterSpacing: 0.2,
    marginBottom: spacing.md,
  },
  verdictFooter: {
    gap: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingLabel: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    letterSpacing: 2,
    color: y2kTokens.mutedPurple,
  },
  pips: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  pip: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  pipFilled: { backgroundColor: y2kTokens.hotPink },
  pipEmpty:  { backgroundColor: y2kTokens.blush, borderWidth: 1, borderColor: y2kTokens.hotPink },
  ratingNum: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.mutedPurple,
  },
  sig: {
    textAlign: 'right',
    fontSize: 18,
  },

  // Today's Look
  outfitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 10,
  },
  outfitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: y2kTokens.blush,
  },
  outfitPiece: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    letterSpacing: 1.5,
    color: y2kTokens.hotPink,
    width: 54,
    marginTop: 3,
  },
  outfitRight: { flex: 1 },
  outfitCat: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 8,
    letterSpacing: 1.5,
    color: y2kTokens.mutedPurple,
    marginBottom: 2,
  },
  outfitItem: {
    fontFamily: typo.displaySmall.fontFamily,
    fontSize: 17,
    color: y2kTokens.ink,
    lineHeight: 22,
    letterSpacing: typo.displaySmall.letterSpacing,
  },

  // Weekly
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: spacing.sm,
  },
  dailyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: y2kTokens.blush,
  },
  dailyDay: {
    fontFamily: typo.monoData.fontFamily,
    fontSize: 10,
    color: y2kTokens.deepPurple,
    letterSpacing: 0.5,
    width: 36,
  },
  dailyIcon: { marginHorizontal: 2 },
  dailyCond: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.mutedPurple,
    flex: 1,
  },
  dailyPrecip: {
    fontFamily: typo.monoData.fontFamily,
    fontSize: 10,
    color: y2kTokens.hotPink,
    width: 30,
    textAlign: 'right',
  },
  dailyPrecipEmpty: {
    fontFamily: typo.monoData.fontFamily,
    fontSize: 10,
    color: y2kTokens.mutedPurple + '60',
    width: 30,
    textAlign: 'right',
  },
  dailyTemps: {
    flexDirection: 'row',
    gap: 6,
    minWidth: 56,
    justifyContent: 'flex-end',
  },
  dailyMax: {
    fontFamily: typo.displaySmall.fontFamily,
    fontSize: 15,
    color: y2kTokens.deepPurple,
  },
  dailyMin: {
    fontFamily: typo.displayMicro.fontFamily,
    fontSize: 15,
    color: y2kTokens.mutedPurple,
  },

  // Conditions
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
  condItem: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    gap: 4,
    backgroundColor: y2kTokens.blush,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: y2kTokens.hotPink + '30',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  condVal: {
    fontFamily: typo.displaySmall.fontFamily,
    fontSize: 18,
    color: y2kTokens.deepPurple,
    letterSpacing: typo.displaySmall.letterSpacing,
  },
  condLabel: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 8,
    color: y2kTokens.mutedPurple,
    letterSpacing: 1,
    textAlign: 'center',
  },

  // Allergens
  aqiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  aqiVal: {
    fontFamily: typo.displayMedium.fontFamily,
    fontSize: 36,
    color: y2kTokens.deepPurple,
    lineHeight: 48,
    letterSpacing: typo.displayMedium.letterSpacing,
  },
  aqiLabel: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.mutedPurple,
    letterSpacing: 1.5,
    flex: 1,
  },
  pollenRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pollenItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    backgroundColor: y2kTokens.blush,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: y2kTokens.hotPink + '30',
    padding: spacing.sm,
  },
  pollenVal: {
    fontFamily: typo.displaySmall.fontFamily,
    fontSize: 18,
    color: y2kTokens.deepPurple,
    lineHeight: 22,
  },
  pollenSub: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 8,
    color: y2kTokens.hotPink,
    letterSpacing: 0.5,
  },
  pollenType: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 8,
    color: y2kTokens.mutedPurple,
    letterSpacing: 1,
  },

  // Refresh
  refreshRow: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshMeta: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.mutedPurple,
    letterSpacing: 0.5,
  },
  refreshBtn: {
    fontFamily: typo.monoData.fontFamily,
    fontSize: 10,
    color: y2kTokens.hotPink,
    letterSpacing: 0.5,
  },

  // Empty state
  emptyState: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyCard: {},
  emptyCardInner: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyRule: {
    height: 1,
    backgroundColor: y2kTokens.blush,
    alignSelf: 'stretch',
    marginVertical: spacing.md,
  },
  emptyTitle: {
    fontFamily: typo.displayMedium.fontFamily,
    fontSize: 28,
    color: y2kTokens.ink,
    letterSpacing: typo.displayMedium.letterSpacing,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: typo.editorialItalic.fontFamily,
    fontSize: 17,
    color: y2kTokens.mutedPurple,
    lineHeight: 26,
    textAlign: 'center',
  },
  emptySig: {
    fontSize: 17,
  },
  emptyBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: y2kTokens.deepPurple,
    borderRadius: 4,
    alignItems: 'center',
  },
  emptyBtnText: {
    fontFamily: typo.monoLabel.fontFamily,
    fontSize: 10,
    color: y2kTokens.lime,
    letterSpacing: 2,
  },

  // Graph
  graphCard: {
    overflow: 'hidden',
  },
  graphPad: {
    paddingVertical: spacing.sm,
  },
}); }  // end makeStyles
