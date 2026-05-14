import React, { useRef, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Platform, StatusBar, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppData } from '../contexts/AppContext';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

// ─── Word of the Day ──────────────────────────────────────────────────────────

interface WordEntry {
  word: string;
  origin: string;
  definition: string;
}

const WORDS: WordEntry[] = [
  { word: 'Sartorial',       origin: 'Latin · sartōrius',        definition: 'Relating to tailoring or the making of fine garments.' },
  { word: 'Sprezzatura',     origin: 'Italian',                   definition: 'The art of making the difficult look effortless; studied carelessness.' },
  { word: 'Insouciant',      origin: 'French · insoucier',        definition: 'Showing a casual lack of concern; blithely indifferent.' },
  { word: 'Louche',          origin: 'French',                    definition: 'Disreputable or rakish in an intriguing, appealing way.' },
  { word: 'Élan',            origin: 'French',                    definition: 'Energy, style, and flair; vivacious enthusiasm.' },
  { word: 'Panache',         origin: 'French · pennacchio',       definition: 'A flamboyant confidence of style or manner.' },
  { word: 'Diaphanous',      origin: 'Greek · diaphanēs',         definition: 'Light, delicate, and translucent; sheer as gossamer.' },
  { word: 'Bespoke',         origin: 'Old English · bespeoken',   definition: 'Made to order; custom-crafted to exact specification.' },
  { word: 'Nonchalant',      origin: 'French · nonchaloir',       definition: 'Appearing casually calm and unconcerned; coolly self-assured.' },
  { word: 'Raffish',         origin: 'English',                   definition: 'Unconventional and slightly disreputable, but in an attractive way.' },
  { word: 'Opulent',         origin: 'Latin · opulentus',         definition: 'Ostentatiously rich; richly luxurious and sumptuous.' },
  { word: 'Austere',         origin: 'Greek · austēros',          definition: 'Severe and plain; having no decoration or adornment.' },
  { word: 'Languid',         origin: 'Latin · languidus',         definition: 'Gracefully slow and relaxed; pleasantly without urgency.' },
  { word: 'Silhouette',      origin: 'French · É. de Silhouette', definition: 'The outline or shape of a garment against the body.' },
  { word: 'Atelier',         origin: 'French',                    definition: 'A designer\'s private workshop; a studio of haute couture.' },
  { word: 'Couture',         origin: 'French · coudre',           definition: 'The design and manufacture of fashionable garments; high fashion.' },
  { word: 'Toile',           origin: 'French · cloth',            definition: 'A trial garment made in inexpensive fabric to test a pattern.' },
  { word: 'Maison',          origin: 'French · house',            definition: 'A fashion house; the creative home of a designer\'s vision.' },
  { word: 'Prêt-à-porter',   origin: 'French',                    definition: 'Ready-to-wear; designed for mass production, not made-to-order.' },
  { word: 'Gestalt',         origin: 'German · shape',            definition: 'The overall look perceived as a unified whole, beyond its parts.' },
  { word: 'Zeitgeist',       origin: 'German · time spirit',      definition: 'The defining spirit or mood of a particular era.' },
  { word: 'Démodé',          origin: 'French',                    definition: 'No longer fashionable; out of date; past its moment.' },
  { word: 'Avant-garde',     origin: 'French · advance guard',    definition: 'Favouring experimental, ahead-of-its-time ideas.' },
  { word: 'Ecru',            origin: 'French · unbleached',       definition: 'The beige or off-white colour of unbleached linen.' },
  { word: 'Celadon',         origin: 'French · Céladon',          definition: 'A pale grey-green, like ancient Chinese porcelain glaze.' },
  { word: 'Mauve',           origin: 'French · mallow plant',     definition: 'A pale purple-pink; the first synthetic dye, discovered 1856.' },
  { word: 'Umber',           origin: 'Italian · Umbria',          definition: 'A dark brownish pigment; rich, earthy, and warm.' },
  { word: 'Tawny',           origin: 'Old French · tané',         definition: 'An orange-brown or yellowish-brown; warm as autumn.' },
  { word: 'Alabaster',       origin: 'Greek · alabastron',        definition: 'Smooth and white; translucent like fine-grained gypsum.' },
  { word: 'Burnished',       origin: 'Old French · brunir',       definition: 'Polished by rubbing; having a warm, metallic sheen.' },
  { word: 'Capsule',         origin: 'Latin · capsula',           definition: 'A small, curated collection of versatile, timeless pieces.' },
  { word: 'Curation',        origin: 'Latin · cūrāre',            definition: 'The careful selection and organisation of items for effect.' },
  { word: 'Provenance',      origin: 'French · provenir',         definition: 'The place of origin; the story behind an object.' },
  { word: 'Archive',         origin: 'Greek · arkheion',          definition: 'Historical garments preserved; the memory of a house.' },
  { word: 'Monochromatic',   origin: 'Greek · monos + khroma',    definition: 'Using a single colour in varying shades and tones.' },
  { word: 'Sculptural',      origin: 'Latin · sculptura',         definition: 'Having strong, clear, three-dimensional lines; garment-as-art.' },
  { word: 'Deconstructed',   origin: 'French · déconstruction',   definition: 'Subverting the rules of construction; taken apart and reconceived.' },
  { word: 'Understated',     origin: 'English',                   definition: 'Expressed with restraint; achieving impact through quiet confidence.' },
  { word: 'Draped',          origin: 'Old French · draper',       definition: 'Arranged in graceful, flowing folds; fabric allowed to fall freely.' },
  { word: 'Cinched',         origin: 'Old French · cingle',       definition: 'Gathered tight at the waist; defining the figure.' },
  { word: 'Oversized',       origin: 'English',                   definition: 'Intentionally larger than standard; volume as a design statement.' },
  { word: 'Textural',        origin: 'Latin · textura',           definition: 'Rich in surface quality and tactility; varied in feel.' },
  { word: 'Polished',        origin: 'Latin · polire',            definition: 'Smooth, refined, and sophisticated; carefully finished.' },
  { word: 'Heritage',        origin: 'Old French · héritage',     definition: 'Tradition and craft passed down; the weight of history in cloth.' },
  { word: 'Gilded',          origin: 'Old English · gyldan',      definition: 'Thinly covered in gold; wealthy, gleaming, and opulent.' },
  { word: 'Chromatic',       origin: 'Greek · khroma',            definition: 'Relating to colour; richly hued; vibrant with pigment.' },
  { word: 'Studied',         origin: 'Latin · studēre',           definition: 'Deliberately considered; intentional in its apparent effortlessness.' },
  { word: 'Verdant',         origin: 'Old French · verdoier',     definition: 'Lush and green; rich with the vitality of fresh growth.' },
  { word: 'Slouchy',         origin: 'English',                   definition: 'Relaxed and intentionally casual in structure; artfully undone.' },
  { word: 'Laconic',         origin: 'Greek · Laconia (Sparta)',  definition: 'Using very few words; speaking through silence and restraint.' },
  { word: 'Palette',         origin: 'French · palete',           definition: 'The range of colours used by a designer; a chromatic signature.' },
  { word: 'Je ne sais quoi', origin: 'French',                    definition: 'An indefinable quality that makes something distinctly attractive.' },
  { word: 'Jolie laide',     origin: 'French · pretty ugly',      definition: 'Attractive despite irregular features; beauty that defies convention.' },
  { word: 'Ennui',           origin: 'French · Old French enui',  definition: 'A listless world-weariness; glamorous dissatisfaction.' },
  { word: 'Chic',            origin: 'French · German schick',    definition: 'Elegantly and stylishly dressed; effortlessly sophisticated.' },
  { word: 'Proportion',      origin: 'Latin · proportio',         definition: 'The harmonious relationship between parts of a garment.' },
  { word: 'Craft',           origin: 'Old English · cræft',       definition: 'Skill and precision in the making of things; mastery by hand.' },
  { word: 'Wardrobe',        origin: 'Old French · warderobe',    definition: 'One\'s entire collection of clothing; a curated personal universe.' },
  { word: 'Minimal',         origin: 'Latin · minimus',           definition: 'Reduced to essentials; beauty found in what is left out.' },
  { word: 'Cobalt',          origin: 'German · kobold',           definition: 'A deep, vivid blue; the colour of shadow in bright light.' },
  { word: 'Eclecticism',     origin: 'Greek · eklektikos',        definition: 'Deriving ideas from a broad and varied range of sources.' },
];

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function getWord(): WordEntry {
  return WORDS[dayOfYear() % WORDS.length];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

function uvColor(uv: number): string {
  if (uv <= 2) return '#5CB85C';
  if (uv <= 5) return '#F0C040';
  if (uv <= 7) return '#F08030';
  if (uv <= 10) return '#D84040';
  return '#B040D0';
}

function pollenLevel(val: number): string {
  if (val === 0) return 'None';
  if (val <= 10) return 'Low';
  if (val <= 50) return 'Moderate';
  if (val <= 200) return 'High';
  return 'Very High';
}

// ─── Widget shell ─────────────────────────────────────────────────────────────

type Styles = ReturnType<typeof makeStyles>;
function Widget({ label, children, noPad, styles }: { label: string; children: React.ReactNode; noPad?: boolean; styles: Styles }) {
  return (
    <View style={styles.widget}>
      <Text style={styles.widgetLabel}>{label}</Text>
      <View style={noPad ? undefined : styles.widgetBody}>{children}</View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function TodayScreen() {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const { oracle, profileCtx, streakCtx } = useAppData();
  const { weather, verdict, cachedAt, cachedCity, isFromCache, status } = oracle;
  const profile = profileCtx.profile;
  const { streak, rankTitle } = streakCtx;

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY       = useRef(new Animated.Value(12)).current;

  useFocusEffect(() => {
    heroOpacity.setValue(0);
    heroY.setValue(12);
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(heroY,       { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  });

  const showResult = !!weather && !!verdict;
  const isLoading  = status === 'fetching-weather' || status === 'fetching-verdict';
  const hoursAgo   = cachedAt ? Math.round((Date.now() - cachedAt) / 3600000) : null;
  const word       = getWord();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />

      {/* ── COMPACT HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.wordmark}>Outfit Oracle</Text>
          {streak > 0 && (
            <Text style={styles.streakLabel}>{streak}-DAY {(rankTitle ?? '').toUpperCase()}</Text>
          )}
        </View>
        {cachedCity ? (
          <View style={styles.cityChip}>
            <Text style={styles.cityChipText}>{cachedCity}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── WORD OF THE DAY (always visible) ── */}
        <Widget label="WORD OF THE DAY" styles={styles}>
          <View style={styles.wotdAccent} />
          <Text style={styles.wotdWord}>{word.word}</Text>
          <Text style={styles.wotdOrigin}>{word.origin}</Text>
          <Text style={styles.wotdDef}>{word.definition}</Text>
        </Widget>

        {showResult ? (
          <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroY }] }}>

            {/* ── WEATHER HERO ── */}
            <View style={styles.weatherHero}>
              <View style={styles.heroTop}>
                <View style={styles.heroLeft}>
                  <Text style={styles.heroCity}>{weather.city}</Text>
                  <Text style={styles.heroCountry}>{weather.country}</Text>
                  <Text style={styles.heroCondition}>{weather.conditionLabel.toUpperCase()}</Text>
                </View>
                <MaterialCommunityIcons
                  name={weather.conditionIcon as any}
                  size={48}
                  color="rgba(250,249,246,0.60)"
                />
              </View>

              <Text style={styles.heroTemp}>{weather.temp}°</Text>

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>FEELS</Text>
                  <Text style={styles.heroStatVal}>{weather.feelsLike}°</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>HUMIDITY</Text>
                  <Text style={styles.heroStatVal}>{weather.humidity}%</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>WIND</Text>
                  <Text style={styles.heroStatVal}>{weather.windSpeed}</Text>
                  <Text style={styles.heroStatUnit}>km/h</Text>
                </View>
              </View>
            </View>

            {/* ── HOURLY FORECAST ── */}
            {!!weather.hourly?.length && (
              <Widget label="NEXT 24 HOURS" noPad styles={styles}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourlyList}
                >
                  {weather.hourly.map((h, i) => (
                    <View key={i} style={styles.hourlyItem}>
                      <Text style={styles.hourlyTime}>{h.time}</Text>
                      <MaterialCommunityIcons
                        name={h.conditionIcon as any}
                        size={18}
                        color="rgba(250,249,246,0.60)"
                      />
                      <Text style={styles.hourlyTemp}>{h.temp}°</Text>
                      {h.precipProb > 0 && (
                        <Text style={styles.hourlyPrecip}>{h.precipProb}%</Text>
                      )}
                      {h.uvIndex > 0 && (
                        <View style={[styles.hourlyUV, { borderColor: uvColor(h.uvIndex) + '60' }]}>
                          <Text style={[styles.hourlyUVText, { color: uvColor(h.uvIndex) }]}>
                            UV{h.uvIndex}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </Widget>
            )}

            {/* ── CONDITIONS (UV / SUN / MOON) ── */}
            {(weather.uvIndex !== undefined || weather.sunrise || weather.moonPhaseName) && (
              <Widget label="CONDITIONS" styles={styles}>
                <View style={styles.conditionsRow}>
                  {weather.uvIndex !== undefined && (
                    <View style={styles.condCard}>
                      <MaterialCommunityIcons
                        name="white-balance-sunny"
                        size={20}
                        color={uvColor(weather.uvIndex)}
                      />
                      <Text style={[styles.condCardVal, { color: uvColor(weather.uvIndex) }]}>
                        {weather.uvIndex}
                      </Text>
                      <Text style={styles.condCardLabel}>
                        UV — {uvLabel(weather.uvIndex).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {weather.sunrise && (
                    <View style={styles.condCard}>
                      <MaterialCommunityIcons name="weather-sunset-up" size={20} color="rgba(250,249,246,0.50)" />
                      <Text style={styles.condCardVal}>{weather.sunrise}</Text>
                      <Text style={styles.condCardLabel}>SUNRISE</Text>
                    </View>
                  )}
                  {weather.sunset && (
                    <View style={styles.condCard}>
                      <MaterialCommunityIcons name="weather-sunset-down" size={20} color="rgba(250,249,246,0.50)" />
                      <Text style={styles.condCardVal}>{weather.sunset}</Text>
                      <Text style={styles.condCardLabel}>SUNSET</Text>
                    </View>
                  )}
                  {weather.moonPhaseName && (
                    <View style={styles.condCard}>
                      <MaterialCommunityIcons
                        name={(weather.moonPhaseIcon ?? 'moon-full') as any}
                        size={20}
                        color="rgba(250,249,246,0.50)"
                      />
                      <Text style={styles.condCardLabel}>{weather.moonPhaseName.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              </Widget>
            )}

            {/* ── WEEKLY FORECAST ── */}
            {!!weather.daily?.length && (
              <Widget label="WEEKLY FORECAST" styles={styles}>
                {weather.daily.map((d, i) => (
                  <View
                    key={d.date}
                    style={[
                      styles.dailyRow,
                      i < weather.daily!.length - 1 && styles.dailyRowBorder,
                    ]}
                  >
                    <Text style={styles.dailyDay}>{d.dayLabel}</Text>
                    <MaterialCommunityIcons
                      name={d.conditionIcon as any}
                      size={18}
                      color="rgba(250,249,246,0.55)"
                    />
                    <Text style={styles.dailyCondLabel} numberOfLines={1}>{d.conditionLabel}</Text>
                    {d.precipProb > 0 ? (
                      <Text style={styles.dailyPrecip}>{d.precipProb}%</Text>
                    ) : (
                      <Text style={styles.dailyPrecipEmpty}>—</Text>
                    )}
                    <View style={styles.dailyTemps}>
                      <Text style={styles.dailyTempMax}>{d.tempMax}°</Text>
                      <Text style={styles.dailyTempMin}>{d.tempMin}°</Text>
                    </View>
                  </View>
                ))}
              </Widget>
            )}

            {/* ── ALLERGENS & AIR QUALITY ── */}
            {weather.pollen && (
              <Widget label="ALLERGENS & AIR" styles={styles}>
                <View style={styles.aqiRow}>
                  <Text style={styles.aqiVal}>{weather.pollen.aqi}</Text>
                  <Text style={styles.aqiLabel}>AQI — {weather.pollen.aqiLabel.toUpperCase()}</Text>
                </View>
                <View style={styles.pollenGrid}>
                  {[
                    { label: 'GRASS',   val: weather.pollen.grass },
                    { label: 'BIRCH',   val: weather.pollen.birch },
                    { label: 'RAGWEED', val: weather.pollen.ragweed },
                  ].map(p => (
                    <View key={p.label} style={styles.pollenItem}>
                      <Text style={styles.pollenVal}>{p.val}</Text>
                      <Text style={styles.pollenSubLabel}>{pollenLevel(p.val).toUpperCase()}</Text>
                      <Text style={styles.pollenTypeLabel}>{p.label}</Text>
                    </View>
                  ))}
                </View>
              </Widget>
            )}

            {/* ── THE ORACLE SPEAKS ── */}
            <Widget label="— THE ORACLE SPEAKS —" styles={styles}>
              <Text style={styles.verdictPull} numberOfLines={4}>
                "{verdict.verdict}"
              </Text>
              <View style={styles.verdictMeta}>
                <View>
                  <Text style={styles.verdictMetaLabel}>TODAY'S VIBE</Text>
                  <Text style={styles.verdictVibe}>{verdict.vibe}</Text>
                </View>
                <View style={styles.ratingBlock}>
                  <Text style={styles.verdictMetaLabel}>EFFORT</Text>
                  <View style={styles.ratingDashes}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <View key={i} style={[styles.dash, i < verdict.rating ? styles.dashFilled : styles.dashEmpty]} />
                    ))}
                  </View>
                </View>
              </View>
            </Widget>

            {/* ── TODAY'S LOOK (outfit chips) ── */}
            <Widget label="TODAY'S LOOK" styles={styles}>
              {verdict.outfits.slice(0, 3).map(item => (
                <View key={item.category} style={styles.chip}>
                  <Text style={styles.chipCategory}>{item.category.toUpperCase()}</Text>
                  <Text style={styles.chipItem}>{item.item}</Text>
                </View>
              ))}
            </Widget>

            {/* ── REFRESH ROW ── */}
            <View style={styles.refreshRow}>
              {hoursAgo !== null && (
                <Text style={styles.refreshMeta}>
                  {hoursAgo === 0 ? 'Just now' : `${hoursAgo}h ago`} · {cachedCity}
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
                  {isLoading ? 'Consulting…' : '+ Refresh verdict'}
                </Text>
              </Pressable>
            </View>

          </Animated.View>
        ) : (
          /* ── EMPTY STATE ── */
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="eye-outline" size={40} color="rgba(250,249,246,0.20)" />
            <Text style={styles.emptyTitle}>The Oracle awaits.</Text>
            <Text style={styles.emptySub}>
              Head to the Oracle tab to receive{'\n'}today's verdict.
            </Text>
          </View>
        )}

        {/* ── GREETING ── */}
        {profile?.name ? (
          <View style={styles.greetingRow}>
            <Text style={styles.greetingSub}>
              {streak > 0
                ? `${streak} consecutive days of devotion.`
                : 'The Oracle is ready when you are.'}
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: AppColors, fonts: AppFonts) { return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },

  /* Header */
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: '#FAF9F6',
    letterSpacing: -0.3,
  },
  streakLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: colors.scarlet,
    marginTop: 2,
  },
  cityChip: {
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.20)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  cityChipText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: 'rgba(250,249,246,0.50)',
    letterSpacing: 1,
  },

  scroll: { flex: 1 },
  content: { paddingBottom: 48 },

  /* ── Widget shell ── */
  widget: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: '#111009',
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.08)',
  },
  widgetLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2.5,
    color: 'rgba(250,249,246,0.30)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(250,249,246,0.06)',
  },
  widgetBody: {
    padding: spacing.md,
  },

  /* ── Word of the Day ── */
  wotdAccent: {
    width: 2,
    height: '100%',
    backgroundColor: colors.scarlet,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  wotdWord: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: '#FAF9F6',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  wotdOrigin: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.scarlet,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  wotdDef: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: 'rgba(250,249,246,0.55)',
    lineHeight: 18,
    letterSpacing: 0.2,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },

  /* ── Weather hero ── */
  weatherHero: {
    backgroundColor: '#111009',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.08)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  heroLeft: { flex: 1 },
  heroCity: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: '#FAF9F6',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  heroCountry: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.45)',
    letterSpacing: 1,
    marginTop: 2,
  },
  heroCondition: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.55)',
    letterSpacing: 2,
    marginTop: 6,
  },
  heroTemp: {
    fontFamily: fonts.displayLight,
    fontSize: 96,
    color: '#FAF9F6',
    lineHeight: 96,
    letterSpacing: -4,
    marginBottom: spacing.lg,
  },
  heroStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(250,249,246,0.10)',
    paddingTop: spacing.md,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(250,249,246,0.10)',
  },
  heroStatLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: 'rgba(250,249,246,0.40)',
    marginBottom: 4,
  },
  heroStatVal: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#FAF9F6',
    lineHeight: 24,
  },
  heroStatUnit: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: 'rgba(250,249,246,0.35)',
    marginTop: 2,
  },

  /* ── Hourly forecast ── */
  hourlyList: {
    gap: 4,
    padding: spacing.md,
  },
  hourlyItem: {
    alignItems: 'center',
    width: 56,
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.07)',
  },
  hourlyTime: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: 'rgba(250,249,246,0.40)',
    letterSpacing: 0.5,
  },
  hourlyTemp: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#FAF9F6',
  },
  hourlyPrecip: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: '#4FA3D4',
    letterSpacing: 0.3,
  },
  hourlyUV: {
    borderWidth: 1,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  hourlyUVText: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 0.5,
  },

  /* ── Conditions ── */
  conditionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  condCard: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.09)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  condCardVal: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#FAF9F6',
    lineHeight: 26,
  },
  condCardLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    color: 'rgba(250,249,246,0.35)',
    textAlign: 'center',
  },

  /* ── Weekly forecast ── */
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: spacing.sm,
  },
  dailyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(250,249,246,0.07)',
  },
  dailyDay: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.55)',
    letterSpacing: 0.5,
    width: 38,
  },
  dailyCondLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: 'rgba(250,249,246,0.35)',
    flex: 1,
    letterSpacing: 0.3,
  },
  dailyPrecip: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: '#4FA3D4',
    width: 32,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  dailyPrecipEmpty: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.15)',
    width: 32,
    textAlign: 'right',
  },
  dailyTemps: {
    flexDirection: 'row',
    gap: 6,
    minWidth: 64,
    justifyContent: 'flex-end',
  },
  dailyTempMax: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#FAF9F6',
  },
  dailyTempMin: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: 'rgba(250,249,246,0.30)',
  },

  /* ── Allergens & AQI ── */
  aqiRow: { marginBottom: spacing.md },
  aqiVal: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    color: '#FAF9F6',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  aqiLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: 'rgba(250,249,246,0.35)',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  pollenGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pollenItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.09)',
    padding: spacing.sm,
    gap: 3,
    alignItems: 'center',
  },
  pollenVal: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#FAF9F6',
    lineHeight: 26,
  },
  pollenSubLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: 'rgba(250,249,246,0.45)',
    letterSpacing: 0.5,
  },
  pollenTypeLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: 'rgba(250,249,246,0.25)',
    letterSpacing: 1,
  },

  /* ── Oracle verdict ── */
  verdictPull: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: '#FAF9F6',
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  verdictMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: 'rgba(250,249,246,0.10)',
    paddingTop: spacing.md,
  },
  verdictMetaLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(250,249,246,0.35)',
    marginBottom: 4,
  },
  verdictVibe: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#FAF9F6',
  },
  ratingBlock: { alignItems: 'flex-end' },
  ratingDashes: { flexDirection: 'row', gap: 4, marginTop: 4 },
  dash: { width: 16, height: 3 },
  dashFilled: { backgroundColor: '#FAF9F6' },
  dashEmpty:  { backgroundColor: 'rgba(250,249,246,0.15)' },

  /* ── Outfit chips ── */
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(250,249,246,0.07)',
  },
  chipCategory: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: 'rgba(250,249,246,0.35)',
    width: 72,
  },
  chipItem: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#FAF9F6',
    flex: 1,
    letterSpacing: -0.2,
  },

  /* ── Refresh row ── */
  refreshRow: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshMeta: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: 'rgba(250,249,246,0.30)',
    letterSpacing: 0.5,
  },
  refreshBtn: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.50)',
    letterSpacing: 0.5,
  },

  /* ── Empty state ── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: 'rgba(250,249,246,0.45)',
    letterSpacing: -0.5,
  },
  emptySub: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.25)',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.3,
  },

  /* ── Greeting ── */
  greetingRow: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(250,249,246,0.06)',
  },
  greetingSub: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.20)',
    letterSpacing: 0.3,
  },
}); }
