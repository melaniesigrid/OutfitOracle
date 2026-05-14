import React, { useRef, useMemo, useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Platform, StatusBar, Animated, LayoutChangeEvent,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppData } from '../contexts/AppContext';
import { AppColors, AppFonts, ThemeName, isEditorialTheme, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

// ─── Theme icon mapping ───────────────────────────────────────────────────────
// Each warm theme substitutes a curated set of MCIcons for the base weather icons.
// Morning Paper → outline / botanical  Terra Firma → solid / earthy  Golden Hour → glowing / warm

const THEME_ICON_MAP: Partial<Record<ThemeName, Record<string, string>>> = {
  'morning-paper': {
    'weather-sunny':       'white-balance-sunny',   // geometric circle, clean
    'weather-cloudy':      'cloud-outline',          // delicate outline
    'weather-rainy':       'water-outline',          // droplet outline, botanical
    'weather-pouring':     'weather-rainy',          // keep legible
    'weather-snowy':       'snowflake',              // precise geometric
    'weather-snowy-heavy': 'snowflake-variant',      // alternate geometric
  },
  'terra-firma': {
    'weather-cloudy':      'cloud',                  // solid, heavy
    'weather-fog':         'weather-fog',            // keep
  },
  'golden-hour': {
    'weather-sunny':         'flare',               // starburst glow
    'weather-partly-cloudy': 'weather-sunset',      // warm horizon
    'weather-fog':           'weather-hazy',        // hazier, warmer
  },
};

function themeIcon(base: string, theme: ThemeName): string {
  return THEME_ICON_MAP[theme]?.[base] ?? base;
}

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

// ─── Hourly graph ─────────────────────────────────────────────────────────────

const GRAPH_COL_W  = 64;
const GRAPH_H      = 110; // range for the curve
const GRAPH_TOP    = 44;  // space above curve: time + icon
const GRAPH_BOTTOM = 28;  // space below curve: precip/uv

interface HourlyPoint {
  time: string;
  temp: number;
  conditionIcon: string;
  precipProb: number;
  uvIndex: number;
}

function HourlyGraph({
  hours,
  accentColor,
  textHigh,
  textFaint,
  lineColor,
  iconColor,
  fonts,
  themeIconFn,
}: {
  hours: HourlyPoint[];
  accentColor: string;
  textHigh: string;
  textFaint: string;
  lineColor: string;
  iconColor: string;
  fonts: AppFonts;
  themeIconFn: (base: string) => string;
}) {
  const temps  = hours.map(h => h.temp);
  const minT   = Math.min(...temps);
  const maxT   = Math.max(...temps);
  const range  = Math.max(maxT - minT, 4); // minimum range of 4° to avoid degenerate curve
  const totalH = GRAPH_TOP + GRAPH_H + GRAPH_BOTTOM;
  const totalW = hours.length * GRAPH_COL_W;

  function yFor(t: number): number {
    return GRAPH_TOP + (1 - (t - minT) / range) * GRAPH_H;
  }
  function xFor(i: number): number {
    return i * GRAPH_COL_W + GRAPH_COL_W / 2;
  }

  // Build rotated line segments connecting adjacent temp points
  const lines = hours.slice(0, -1).map((h, i) => {
    const x1 = xFor(i); const y1 = yFor(h.temp);
    const x2 = xFor(i + 1); const y2 = yFor(hours[i + 1].temp);
    const dx = x2 - x1; const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x1, y1, len, angle, key: i };
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ width: totalW, height: totalH }}>

        {/* Connecting curve lines */}
        {lines.map(l => (
          <View
            key={l.key}
            style={{
              position: 'absolute',
              left: l.x1,
              top: l.y1 - 0.75,
              width: l.len,
              height: 1.5,
              backgroundColor: lineColor,
              transformOrigin: '0% 50%',
              transform: [{ rotate: `${l.angle}deg` }],
            }}
          />
        ))}

        {/* Data points */}
        {hours.map((h, i) => {
          const cx = xFor(i);
          const cy = yFor(h.temp);
          return (
            <React.Fragment key={i}>
              {/* Dot on curve */}
              <View style={{
                position: 'absolute',
                left: cx - 3,
                top: cy - 3,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: lineColor,
              }} />

              {/* Time label (always at top) */}
              <Text style={{
                position: 'absolute',
                left: cx - GRAPH_COL_W / 2,
                top: 0,
                width: GRAPH_COL_W,
                textAlign: 'center',
                fontFamily: fonts.mono,
                fontSize: 9,
                color: textFaint,
                letterSpacing: 0.3,
              }}>{h.time}</Text>

              {/* Icon — floats just above the curve */}
              <MaterialCommunityIcons
                name={themeIconFn(h.conditionIcon) as any}
                size={16}
                color={iconColor}
                style={{
                  position: 'absolute',
                  left: cx - 8,
                  top: cy - 26,
                }}
              />

              {/* Temp label — just below the curve dot */}
              <Text style={{
                position: 'absolute',
                left: cx - GRAPH_COL_W / 2,
                top: cy + 6,
                width: GRAPH_COL_W,
                textAlign: 'center',
                fontFamily: fonts.mono,
                fontSize: 11,
                color: textHigh,
                letterSpacing: -0.3,
              }}>{h.temp}°</Text>

              {/* Precip % — pinned to bottom */}
              {h.precipProb > 0 && (
                <Text style={{
                  position: 'absolute',
                  left: cx - GRAPH_COL_W / 2,
                  top: totalH - GRAPH_BOTTOM + 4,
                  width: GRAPH_COL_W,
                  textAlign: 'center',
                  fontFamily: fonts.mono,
                  fontSize: 9,
                  color: accentColor,
                  letterSpacing: 0.2,
                }}>{h.precipProb}%</Text>
              )}
            </React.Fragment>
          );
        })}

      </View>
    </ScrollView>
  );
}

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
  const { colors, fonts, themeName } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts, themeName), [colors, fonts, themeName]);
  const { oracle, profileCtx, streakCtx } = useAppData();
  const { weather, verdict, cachedAt, cachedCity, isFromCache, status } = oracle;
  const profile = profileCtx.profile;
  const { streak, rankTitle } = streakCtx;

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY       = useRef(new Animated.Value(12)).current;

  useFocusEffect(
    useCallback(() => {
      heroOpacity.setValue(0);
      heroY.setValue(12);
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroY,       { toValue: 0, duration: 450, useNativeDriver: true }),
      ]).start();
    }, [heroOpacity, heroY])
  );

  const showResult = !!weather && !!verdict;
  const isLoading  = status === 'fetching-weather' || status === 'fetching-verdict';
  const hoursAgo   = cachedAt ? Math.round((Date.now() - cachedAt) / 3600000) : null;
  const word       = getWord();

  const isWarmTheme   = themeName === 'terra-firma' || themeName === 'morning-paper' || themeName === 'golden-hour' || themeName === 'electric';
  const isBannerTheme = themeName === 'morning-paper' || themeName === 'golden-hour' || themeName === 'electric';
  const heroIconColor = isWarmTheme ? colors.scarlet : 'rgba(250,249,246,0.60)';
  // Precipitation color: Electric has vivid-blue bg — light-blue #4FA3D4 blends in; use periwinkle textSecondary instead
  const precipAccentColor = themeName === 'electric' ? colors.textSecondary : '#4FA3D4';
  // Condition widget icons: warm themes render on light bg, dark-surface rgba is invisible there
  const condIconColor = isWarmTheme ? colors.textMuted : 'rgba(250,249,246,0.50)';

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
          {isWarmTheme ? (
            <View style={styles.wotdInner}>
              <View style={styles.wotdRule} />
              <View style={styles.wotdTextCol}>
                <Text style={[styles.wotdWord, { paddingHorizontal: 0, paddingTop: 0 }]}>{word.word}</Text>
                <Text style={[styles.wotdOrigin, { paddingHorizontal: 0 }]}>{word.origin}</Text>
                <Text style={[styles.wotdDef, { paddingHorizontal: 0, paddingBottom: 0 }]}>{word.definition}</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.wotdAccent} />
              <Text style={styles.wotdWord}>{word.word}</Text>
              <Text style={styles.wotdOrigin}>{word.origin}</Text>
              <Text style={styles.wotdDef}>{word.definition}</Text>
            </>
          )}
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
                  name={themeIcon(weather.conditionIcon, themeName) as any}
                  size={isWarmTheme ? 52 : 48}
                  color={heroIconColor}
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
                <View style={styles.graphPad}>
                  <HourlyGraph
                    hours={weather.hourly}
                    accentColor={precipAccentColor}
                    textHigh={styles.hourlyTemp.color as string}
                    textFaint={styles.hourlyTime.color as string}
                    lineColor={isWarmTheme ? colors.scarlet + 'A0' : 'rgba(250,249,246,0.30)'}
                    iconColor={heroIconColor}
                    fonts={fonts}
                    themeIconFn={(base) => themeIcon(base, themeName)}
                  />
                </View>
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
                      <MaterialCommunityIcons name="weather-sunset-up" size={20} color={condIconColor} />
                      <Text style={styles.condCardVal}>{weather.sunrise}</Text>
                      <Text style={styles.condCardLabel}>SUNRISE</Text>
                    </View>
                  )}
                  {weather.sunset && (
                    <View style={styles.condCard}>
                      <MaterialCommunityIcons name="weather-sunset-down" size={20} color={condIconColor} />
                      <Text style={styles.condCardVal}>{weather.sunset}</Text>
                      <Text style={styles.condCardLabel}>SUNSET</Text>
                    </View>
                  )}
                  {weather.moonPhaseName && (
                    <View style={styles.condCard}>
                      <MaterialCommunityIcons
                        name={(weather.moonPhaseIcon ?? 'moon-full') as any}
                        size={20}
                        color={condIconColor}
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
                      name={themeIcon(d.conditionIcon, themeName) as any}
                      size={18}
                      color={isWarmTheme ? colors.scarlet + '80' : 'rgba(250,249,246,0.55)'}
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
                  <View style={styles.aqiValRow}>
                    <MaterialCommunityIcons name="bee" size={22} color={styles.aqiVal.color as string} />
                    <Text style={styles.aqiVal}>{weather.pollen.aqi}</Text>
                  </View>
                  <Text style={styles.aqiLabel}>AQI — {weather.pollen.aqiLabel.toUpperCase()}</Text>
                </View>
                <View style={styles.pollenGrid}>
                  {[
                    { label: 'GRASS',   val: weather.pollen.grass,   icon: 'grass'         as const },
                    { label: 'BIRCH',   val: weather.pollen.birch,   icon: 'leaf-maple'    as const },
                    { label: 'RAGWEED', val: weather.pollen.ragweed, icon: 'flower-pollen' as const },
                  ].map(p => (
                    <View key={p.label} style={styles.pollenItem}>
                      <MaterialCommunityIcons name={p.icon} size={16} color={styles.pollenTypeLabel.color as string} />
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
              {isWarmTheme ? (
                <View style={styles.chipWrap}>
                  {verdict.outfits.slice(0, 3).map((item, i) => (
                    <View
                      key={item.category}
                      style={[styles.chipTag, i === 0 && styles.chipTagAccent]}
                    >
                      <Text style={styles.chipTagText}>{item.item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                verdict.outfits.slice(0, 3).map(item => (
                  <View key={item.category} style={styles.chip}>
                    <Text style={styles.chipCategory}>{item.category.toUpperCase()}</Text>
                    <Text style={styles.chipItem}>{item.item}</Text>
                  </View>
                ))
              )}
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
            <Text style={styles.emptyGlyph}>—</Text>
            <View style={styles.emptyRule} />
            <Text style={styles.emptyTitle}>The Oracle awaits.</Text>
            <Text style={styles.emptySub}>Head to Oracle to{'\n'}receive today's verdict.</Text>
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

function makeStyles(colors: AppColors, fonts: AppFonts, themeName: ThemeName) {
  const isWarm       = themeName === 'terra-firma' || themeName === 'morning-paper' || themeName === 'golden-hour' || themeName === 'electric';
  const isBanner     = themeName === 'morning-paper' || themeName === 'golden-hour' || themeName === 'electric';
  const isTerraFirma = themeName === 'terra-firma';
  const precipColor  = themeName === 'electric' ? colors.textSecondary : '#4FA3D4';

  // ── Surface token set ───────────────────────────────────────────────────────
  // Warm themes use a light scrollable surface; Classic/Editorial use dark cards.
  const S = {
    widgetBg:   isWarm ? colors.bg      : colors.bgDark,
    label:      isWarm ? colors.textMuted       : 'rgba(250,249,246,0.30)',
    high:       isWarm ? colors.textPrimary     : '#FAF9F6',
    med:        isWarm ? colors.textSecondary   : 'rgba(250,249,246,0.80)',
    low:        isWarm ? colors.textMuted       : 'rgba(250,249,246,0.55)',
    faint:      isWarm ? colors.borderMid       : 'rgba(250,249,246,0.40)',
    ghost:      isWarm ? colors.border          : 'rgba(250,249,246,0.15)',
    divider:    isWarm ? colors.border          : 'rgba(250,249,246,0.07)',
    divMed:     isWarm ? colors.borderMid       : 'rgba(250,249,246,0.10)',
  };

  // ── Hero temperature (always dark panel) ────────────────────────────────────
  const heroTempColor =
    themeName === 'golden-hour' ? colors.scarlet :
    themeName === 'terra-firma' ? '#D4873A' :
    themeName === 'electric'    ? colors.scarlet :
    '#FAF9F6';

  const heroTempSize =
    themeName === 'golden-hour' ? 130 :
    themeName === 'terra-firma' ? 112 :
    96;

  const heroTempShadow = themeName === 'golden-hour' ? {
    textShadowColor: 'rgba(200,128,64,0.40)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  } : {};

  // ── Hero accent colors ──────────────────────────────────────────────────────
  const heroCityColor      = themeName === 'golden-hour' ? '#C4A87A' : '#FAF9F6';
  const heroStatValColor   = themeName === 'golden-hour' ? '#C4A87A' : '#FAF9F6';
  const heroStatLabelColor = themeName === 'golden-hour' ? 'rgba(196,168,122,0.50)' : 'rgba(250,249,246,0.40)';
  const heroStatValFamily  = isWarm ? fonts.mono : fonts.displayBold;
  const heroStatValSize    = isWarm ? 14 : 20;
  const heroStatValLine    = isWarm ? 18 : 24;

  const statDividerColor =
    themeName === 'terra-firma'   ? 'rgba(181,73,26,0.25)'   :
    themeName === 'morning-paper' ? 'rgba(107,127,94,0.25)'  :
    themeName === 'golden-hour'   ? 'rgba(200,128,64,0.25)'  :
    'rgba(250,249,246,0.10)';

  const heroConditionColor  = isWarm ? colors.scarlet : 'rgba(250,249,246,0.55)';
  const cityChipBorderColor = isWarm ? colors.scarlet : 'rgba(250,249,246,0.20)';
  const cityChipTextColor   = isWarm ? colors.scarlet : 'rgba(250,249,246,0.50)';
  const wotdDefFont         = isWarm ? fonts.serif    : fonts.mono;

return StyleSheet.create({
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
    color: !isEditorialTheme(themeName) ? colors.scarlet : 'rgba(250,249,246,0.45)',
    marginTop: 2,
  },
  cityChip: {
    borderWidth: 1,
    borderColor: cityChipBorderColor,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  cityChipText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: cityChipTextColor,
    letterSpacing: 1,
  },

  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48 },

  /* ── Widget shell ── */
  // Terra Firma: white card, heavy 2px terracotta border, side margins (architectural)
  // Banner (Morning Paper / Golden Hour): full-width section, no border, bottom divider only
  // Classic/Editorial: dark card, 1px subtle border, side margins
  widget: {
    marginHorizontal: isBanner ? 0 : spacing.lg,
    marginTop: isBanner ? 0 : spacing.sm,
    backgroundColor: isTerraFirma ? colors.bgCard : S.widgetBg,
    borderWidth: isTerraFirma ? 2 : isBanner ? 0 : 1,
    borderColor: isTerraFirma ? colors.scarlet + '50' : 'rgba(250,249,246,0.07)',
    borderBottomWidth: isBanner ? 1 : 0,
    borderBottomColor: S.divider,
  },
  widgetLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2.5,
    color: S.label,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: S.divider,
    // Terra Firma: left terracotta rule as an architectural detail
    borderLeftWidth: isTerraFirma ? 3 : 0,
    borderLeftColor: colors.scarlet,
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
    fontSize: isWarm ? 30 : 34,
    color: S.high,
    letterSpacing: -0.5,
    lineHeight: isWarm ? 34 : 38,
    marginBottom: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  wotdOrigin: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: !isEditorialTheme(themeName) ? colors.scarlet : 'rgba(250,249,246,0.40)',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  wotdDef: {
    fontFamily: wotdDefFont,
    fontSize: isWarm ? 14 : 12,
    color: S.low,
    lineHeight: isWarm ? 22 : 18,
    letterSpacing: isWarm ? 0.1 : 0.2,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },

  /* ── Weather hero ── */
  weatherHero: {
    backgroundColor: colors.bgDark,
    marginHorizontal: isBanner ? 0 : spacing.lg,
    marginTop: isBanner ? 0 : spacing.sm,
    padding: spacing.lg,
    borderWidth: isTerraFirma ? 2 : isBanner ? 0 : 1,
    borderColor: isTerraFirma ? colors.scarlet + '30' : 'rgba(250,249,246,0.07)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  heroLeft: { flex: 1 },
  heroCity: {
    fontFamily: isWarm ? fonts.mono : fonts.display,
    fontSize: isWarm ? 13 : 28,
    fontWeight: isWarm ? '700' : undefined,
    color: heroCityColor,
    letterSpacing: isWarm ? 0.05 : -0.5,
    lineHeight: isWarm ? 18 : 32,
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
    color: heroConditionColor,
    letterSpacing: 2,
    marginTop: 6,
  },
  heroTemp: {
    fontFamily: fonts.displayLight,
    fontSize: heroTempSize,
    color: heroTempColor,
    lineHeight: heroTempSize,
    letterSpacing: -4,
    marginBottom: spacing.lg,
    ...heroTempShadow,
  },
  heroStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: statDividerColor,
    paddingTop: spacing.md,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: statDividerColor,
  },
  heroStatLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: heroStatLabelColor,
    marginBottom: 4,
  },
  heroStatVal: {
    fontFamily: heroStatValFamily,
    fontSize: heroStatValSize,
    color: heroStatValColor,
    lineHeight: heroStatValLine,
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
    borderColor: S.divider,
  },
  hourlyTime: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: S.faint,
    letterSpacing: 0.5,
  },
  hourlyTemp: {
    fontFamily: isWarm ? fonts.mono : fonts.displayBold,
    fontSize: 16,
    color: S.high,
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
    borderColor: S.divider,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  condCardVal: {
    fontFamily: isWarm ? fonts.mono : fonts.displayBold,
    fontSize: isWarm ? 16 : 22,
    color: S.high,
    lineHeight: isWarm ? 20 : 26,
  },
  condCardLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    color: S.label,
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
    borderBottomColor: S.divider,
  },
  dailyDay: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: S.med,
    letterSpacing: 0.5,
    width: 38,
  },
  dailyCondLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: S.low,
    flex: 1,
    letterSpacing: 0.3,
  },
  dailyPrecip: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: precipColor,
    width: 32,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  dailyPrecipEmpty: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: S.ghost,
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
    fontFamily: isWarm ? fonts.mono : fonts.displayBold,
    fontSize: 16,
    color: S.high,
  },
  dailyTempMin: {
    fontFamily: isWarm ? fonts.mono : fonts.displayBold,
    fontSize: 16,
    color: S.faint,
  },

  /* ── Hourly graph padding ── */
  graphPad: {
    paddingVertical: spacing.sm,
  },

  /* ── Allergens & AQI ── */
  aqiRow: { marginBottom: spacing.md },
  aqiValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aqiVal: {
    fontFamily: isWarm ? fonts.mono : fonts.displayBold,
    fontSize: 36,
    color: S.high,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  aqiLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: S.label,
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
    borderColor: S.divider,
    padding: spacing.sm,
    gap: 3,
    alignItems: 'center',
  },
  pollenVal: {
    fontFamily: isWarm ? fonts.mono : fonts.displayBold,
    fontSize: 22,
    color: S.high,
    lineHeight: 26,
  },
  pollenSubLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: S.low,
    letterSpacing: 0.5,
  },
  pollenTypeLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: S.ghost,
    letterSpacing: 1,
  },

  /* ── Oracle verdict ── */
  verdictPull: {
    fontFamily: fonts.display,
    fontSize: isWarm ? 22 : 20,
    color: S.high,
    lineHeight: isWarm ? 30 : 28,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  verdictMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: S.divMed,
    paddingTop: spacing.md,
  },
  verdictMetaLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: S.label,
    marginBottom: 4,
  },
  verdictVibe: {
    fontFamily: isWarm ? fonts.mono : fonts.displayBold,
    fontSize: 16,
    color: S.high,
  },
  ratingBlock: { alignItems: 'flex-end' },
  ratingDashes: { flexDirection: 'row', gap: 4, marginTop: 4 },
  dash: { width: 16, height: 3 },
  dashFilled: { backgroundColor: S.high },
  dashEmpty:  { backgroundColor: S.ghost },

  /* ── Outfit chips ── */
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: S.divider,
  },
  chipCategory: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: S.label,
    width: 72,
  },
  chipItem: {
    fontFamily: isWarm ? fonts.display : fonts.displayBold,
    fontSize: isWarm ? 18 : 16,
    color: S.high,
    flex: 1,
    letterSpacing: isWarm ? -0.3 : -0.2,
  },

  /* ── WOTD warm layout (flex-row rule + text) ── */
  wotdInner: {
    flexDirection: 'row',
    gap: 14,
    padding: spacing.md,
  },
  wotdRule: {
    width: 2,
    backgroundColor: colors.scarlet,
    minHeight: 64,
  },
  wotdTextCol: {
    flex: 1,
  },

  /* ── Outfit chips — horizontal wrap (warm themes) ── */
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipTag: {
    borderWidth: 1,
    borderColor: colors.scarlet,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  chipTagAccent: {
    backgroundColor: colors.scarlet + '12',
  },
  chipTagText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 0.15,
    color: colors.scarlet,
    textTransform: 'uppercase' as const,
  },
  chipTagTextSecondary: {
    color: colors.textSecondary,
    borderColor: colors.border,
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
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  refreshBtn: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

  /* ── Empty state ── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 72,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyGlyph: {
    fontFamily: fonts.displayLight,
    fontSize: 80,
    lineHeight: 72,
    color: S.faint,
    letterSpacing: -2,
  },
  emptyRule: {
    width: 28,
    height: 1,
    backgroundColor: S.ghost,
    marginVertical: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: S.med,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: S.label,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginTop: spacing.xs,
  },

  /* ── Greeting ── */
  greetingRow: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  greetingSub: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
}); }
