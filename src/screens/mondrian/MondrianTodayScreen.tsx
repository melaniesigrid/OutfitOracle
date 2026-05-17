import React, { useRef, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Platform, StatusBar, Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppData } from '../../contexts/AppContext';
import { useTempUnit } from '../../contexts/TemperatureContext';
import { HourlyGraph } from '../../components/HourlyGraph';
import { mondrianTokens, spacing } from '../../theme';

const { red, blue, yellow, black, white, gridLine } = mondrianTokens;

// ─── Memphis pattern ──────────────────────────────────────────────────────────
// Hand-placed dash marks on a white ground, simulating the Memphis-style
// sprinkle pattern from the brief.

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
  { top: 14, left: 350, angle: -80, len: 7  },
  { top: 60, left: 10,  angle: 25,  len: 9  },
  { top: 65, left: 75,  angle: -60, len: 8  },
  { top: 70, left: 120, angle: 75,  len: 7  },
  { top: 62, left: 165, angle: -15, len: 10 },
  { top: 72, left: 210, angle: 45,  len: 8  },
  { top: 68, left: 255, angle: -85, len: 7  },
  { top: 75, left: 300, angle: 20,  len: 9  },
  { top: 80, left: 345, angle: -40, len: 8  },
];

const DOTS: Array<{ top: number; left: number }> = [
  { top: 15,  left: 42  },
  { top: 28,  left: 94  },
  { top: 10,  left: 136 },
  { top: 33,  left: 185 },
  { top: 8,   left: 232 },
  { top: 20,  left: 278 },
  { top: 35,  left: 320 },
  { top: 48,  left: 55  },
  { top: 52,  left: 100 },
  { top: 46,  left: 150 },
  { top: 58,  left: 198 },
  { top: 43,  left: 245 },
  { top: 60,  left: 292 },
  { top: 54,  left: 338 },
  { top: 70,  left: 30  },
  { top: 76,  left: 145 },
  { top: 65,  left: 235 },
  { top: 78,  left: 315 },
];

// ─── Weather helpers ─────────────────────────────────────────────────────────

function uvColor(uv: number): string {
  if (uv <= 2) return '#5CB85C';
  if (uv <= 5) return '#F0C040';
  if (uv <= 7) return '#F08030';
  if (uv <= 10) return '#D84040';
  return '#B040D0';
}

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

function pollenLevel(val: number): string {
  if (val === 0) return 'None';
  if (val <= 10) return 'Low';
  if (val <= 50) return 'Moderate';
  if (val <= 200) return 'High';
  return 'Very High';
}

function MemphisBackground({ height = 90 }: { height?: number }) {
  return (
    <View style={{ height, width: '100%', backgroundColor: white, overflow: 'hidden', position: 'relative' }}>
      {DASHES.map((d, i) => (
        <View
          key={`d${i}`}
          style={{
            position: 'absolute',
            top: d.top,
            left: d.left,
            width: d.len,
            height: 1.5,
            backgroundColor: black,
            transform: [{ rotate: `${d.angle}deg` }],
          }}
        />
      ))}
      {DOTS.map((d, i) => (
        <View
          key={`dot${i}`}
          style={{
            position: 'absolute',
            top: d.top,
            left: d.left,
            width: 2.5,
            height: 2.5,
            borderRadius: 1.25,
            backgroundColor: black,
          }}
        />
      ))}
    </View>
  );
}

// ─── Grid divider ─────────────────────────────────────────────────────────────

function GridLine({ horizontal = true }: { horizontal?: boolean }) {
  return (
    <View style={horizontal
      ? { height: gridLine, backgroundColor: black, width: '100%' }
      : { width: gridLine, backgroundColor: black, alignSelf: 'stretch' }
    } />
  );
}

// ─── Section label bar ────────────────────────────────────────────────────────

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

// ─── Panel cell ───────────────────────────────────────────────────────────────

function Panel({ bg, children, flex, style }: {
  bg: string;
  children: React.ReactNode;
  flex?: number;
  style?: object;
}) {
  return (
    <View style={[{ backgroundColor: bg, flex }, style]}>
      {children}
    </View>
  );
}

// ─── Outfit item card ─────────────────────────────────────────────────────────

const ACCENT_COLORS: Record<string, { bg: string; text: string }> = {
  mint:     { bg: blue,   text: white  },
  lavender: { bg: red,    text: white  },
  coral:    { bg: yellow, text: black  },
  lemon:    { bg: white,  text: black  },
  iris:     { bg: black,  text: white  },
};

function OutfitRow({ item }: { item: { category: string; item: string; detail: string; accentColor: string } }) {
  const { bg, text } = ACCENT_COLORS[item.accentColor] ?? { bg: white, text: black };
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
        <View style={{ width: gridLine, backgroundColor: black }} />
        <View style={{ width: 40, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 11, color: text, letterSpacing: 1, transform: [{ rotate: '90deg' }], width: 60, textAlign: 'center' }}>
            {item.category.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Word of the day ──────────────────────────────────────────────────────────

const WORDS = [
  { word: 'Sartorial',   definition: 'Relating to tailoring or the making of fine garments.' },
  { word: 'Sprezzatura', definition: 'The art of making the difficult look effortless.' },
  { word: 'Insouciant',  definition: 'Showing a casual lack of concern; blithely indifferent.' },
  { word: 'Louche',      definition: 'Disreputable or rakish in an intriguing, appealing way.' },
  { word: 'Panache',     definition: 'A flamboyant confidence of style or manner.' },
  { word: 'Diaphanous',  definition: 'Light, delicate, and translucent; sheer as gossamer.' },
  { word: 'Bespoke',     definition: 'Made to order; custom-crafted to exact specification.' },
  { word: 'Nonchalant',  definition: 'Coolly calm; achieving impact through quiet confidence.' },
  { word: 'Opulent',     definition: 'Ostentatiously rich; richly luxurious and sumptuous.' },
  { word: 'Avant-garde', definition: 'Favouring experimental, ahead-of-its-time ideas.' },
];

function dayOfYear(): number {
  const now = new Date();
  return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MondrianTodayScreen() {
  const navigation = useNavigation<any>();
  const { oracle, streakCtx, profileCtx } = useAppData();
  const { weather, verdict, cachedCity, status, cachedAt } = oracle;
  const { streak, rankTitle } = streakCtx;
  const profile = profileCtx.profile;
  const { formatTemp } = useTempUnit();
  const hoursAgo = cachedAt ? Math.round((Date.now() - cachedAt) / 3600000) : null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, [fadeAnim]),
  );

  const showResult = !!weather && !!verdict;
  const isLoading  = status === 'fetching-weather' || status === 'fetching-verdict';
  const word       = WORDS[dayOfYear() % WORDS.length];
  const today      = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).toUpperCase();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={black} />

      {/* ── TOP GRID: Memphis white area ── */}
      <MemphisBackground height={80} />
      <GridLine />

      {/* ── BLACK HEADER BAR ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.wordmark}>OUTFIT ORACLE</Text>
          {streak > 0 && (
            <Text style={s.streakLabel}>{streak} DAYS · {(rankTitle ?? '').toUpperCase()}</Text>
          )}
        </View>
        <View style={s.headerRight}>
          {cachedCity ? (
            <Pressable
              onPress={() => navigation.navigate('Oracle')}
              style={({ pressed }) => [s.cityChip, { opacity: pressed ? 0.7 : 1 }]}
              accessibilityLabel={`Go to Oracle for ${cachedCity}`}
            >
              <Text style={s.cityChipText}>{cachedCity?.toUpperCase()}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={{ padding: 4 }}
            accessibilityLabel="Settings"
          >
            <MaterialCommunityIcons name="cog-outline" size={16} color={yellow} />
          </Pressable>
        </View>
      </View>

      {/* ── YELLOW DATE BAR ── */}
      <View style={s.dateBar}>
        <Text style={s.dateText}>{today}</Text>
      </View>
      <GridLine />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {showResult ? (
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* ── HERO: Temp (red) + Condition (white) ── */}
            <View style={s.heroRow}>
              <Panel bg={red} flex={1} style={{ padding: 16 }}>
                <Text style={s.heroTemp}>{formatTemp(weather.temp)}</Text>
                <Text style={s.heroTempUnit}>°</Text>
              </Panel>
              <View style={{ width: gridLine, backgroundColor: black }} />
              <Panel bg={white} flex={1} style={{ padding: 16 }}>
                <Text style={s.heroCondition}>{weather.conditionLabel.toUpperCase()}</Text>
                <Text style={s.heroHighLow}>
                  {weather.daily?.[0]
                    ? `H ${formatTemp(weather.daily[0].tempMax)} · L ${formatTemp(weather.daily[0].tempMin)}`
                    : ''}
                </Text>
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name={weather.conditionIcon as any} size={22} color={black} />
                  <Text style={s.heroFeels}>FEELS {formatTemp(weather.feelsLike)}</Text>
                </View>
              </Panel>
            </View>
            <GridLine />

            {/* ── WEATHER DETAIL ROW: Wind (blue) + UV (yellow) + Humidity (white) ── */}
            <View style={{ flexDirection: 'row' }}>
              <Panel bg={blue} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
                <Text style={s.statLabel}>WIND</Text>
                <Text style={[s.statValue, { color: white }]}>{weather.windSpeed}</Text>
                <Text style={[s.statUnit, { color: 'rgba(255,255,255,0.65)' }]}>KM/H</Text>
              </Panel>
              <View style={{ width: gridLine, backgroundColor: black }} />
              <Panel bg={yellow} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
                <Text style={[s.statLabel, { color: black }]}>UV</Text>
                <Text style={[s.statValue, { color: black }]}>{weather.uvIndex}</Text>
                <Text style={[s.statUnit, { color: 'rgba(0,0,0,0.55)' }]}>INDEX</Text>
              </Panel>
              <View style={{ width: gridLine, backgroundColor: black }} />
              <Panel bg={white} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
                <Text style={s.statLabel}>HUM</Text>
                <Text style={[s.statValue, { color: black }]}>{weather.humidity}</Text>
                <Text style={[s.statUnit, { color: 'rgba(0,0,0,0.45)' }]}>%</Text>
              </Panel>
            </View>

            {/* ── CONDITIONS ── */}
            {(weather.sunrise || weather.sunset || weather.moonPhaseName) && (
              <>
                <SectionBar label="CONDITIONS" bg={black} textColor={yellow} />
                <View style={{ flexDirection: 'row', backgroundColor: white }}>
                  {weather.sunrise && (
                    <>
                      <View style={{ flex: 1, padding: 12, alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="weather-sunset-up" size={20} color={black} />
                        <Text style={s.condValue}>{weather.sunrise}</Text>
                        <Text style={s.condLabel}>SUNRISE</Text>
                      </View>
                      <View style={{ width: gridLine, backgroundColor: black }} />
                    </>
                  )}
                  {weather.sunset && (
                    <>
                      <View style={{ flex: 1, padding: 12, alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="weather-sunset-down" size={20} color={black} />
                        <Text style={s.condValue}>{weather.sunset}</Text>
                        <Text style={s.condLabel}>SUNSET</Text>
                      </View>
                      {weather.moonPhaseName && <View style={{ width: gridLine, backgroundColor: black }} />}
                    </>
                  )}
                  {weather.moonPhaseName && (
                    <View style={{ flex: 1, padding: 12, alignItems: 'center', gap: 4 }}>
                      <MaterialCommunityIcons
                        name={(weather.moonPhaseIcon ?? 'moon-full') as any}
                        size={20}
                        color={black}
                      />
                      <Text style={s.condLabel}>{weather.moonPhaseName.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <GridLine />
              </>
            )}

            {/* ── HOURLY FORECAST ── */}
            {!!weather.hourly?.length && (
              <>
                <SectionBar label="NEXT 24 HOURS" bg={blue} textColor={white} />
                <View style={{ backgroundColor: white, paddingVertical: 8 }}>
                  <HourlyGraph
                    hours={weather.hourly}
                    accentColor={blue}
                    textHigh={black}
                    textFaint={'#777777'}
                    lineColor={'rgba(0,0,0,0.20)'}
                    iconColor={black}
                    monoFont={'IBMPlexMono_400Regular'}
                    formatTemp={formatTemp}
                    themeIconFn={(base) => base}
                  />
                </View>
                <GridLine />
              </>
            )}

            {/* ── WEEKLY FORECAST ── */}
            {!!weather.daily?.length && (
              <>
                <SectionBar label="WEEKLY FORECAST" bg={yellow} textColor={black} />
                <View style={{ backgroundColor: white }}>
                  {weather.daily.map((d, i) => (
                    <View
                      key={d.date}
                      style={[
                        s.dailyRow,
                        i < weather.daily!.length - 1 && s.dailyRowBorder,
                      ]}
                    >
                      <Text style={s.dailyDay}>{d.dayLabel}</Text>
                      <MaterialCommunityIcons name={d.conditionIcon as any} size={18} color={'#555555'} />
                      <Text style={s.dailyCond} numberOfLines={1}>{d.conditionLabel}</Text>
                      {d.precipProb > 0 ? (
                        <Text style={s.dailyPrecip}>{d.precipProb}%</Text>
                      ) : (
                        <Text style={[s.dailyPrecip, { color: '#CCCCCC' }]}>—</Text>
                      )}
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Text style={s.dailyMax}>{formatTemp(d.tempMax)}°</Text>
                        <Text style={s.dailyMin}>{formatTemp(d.tempMin)}°</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <GridLine />
              </>
            )}

            {/* ── ALLERGENS & AIR ── */}
            {weather.pollen && (
              <>
                <SectionBar label="ALLERGENS & AIR" bg={red} textColor={white} />
                <View style={{ backgroundColor: white, padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MaterialCommunityIcons name="bee" size={22} color={black} />
                    <Text style={s.aqiValue}>{weather.pollen.aqi}</Text>
                    <Text style={s.condLabel}>AQI — {weather.pollen.aqiLabel.toUpperCase()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 0 }}>
                    {[
                      { label: 'GRASS',   val: weather.pollen.grass,   icon: 'grass'         as const },
                      { label: 'BIRCH',   val: weather.pollen.birch,   icon: 'leaf-maple'    as const },
                      { label: 'RAGWEED', val: weather.pollen.ragweed, icon: 'flower-pollen' as const },
                    ].map((p, i) => (
                      <View
                        key={p.label}
                        style={[
                          s.pollenCell,
                          i < 2 && { borderRightWidth: gridLine, borderRightColor: black },
                        ]}
                      >
                        <MaterialCommunityIcons name={p.icon} size={16} color={'#555555'} />
                        <Text style={s.aqiValue}>{p.val}</Text>
                        <Text style={s.condLabel}>{pollenLevel(p.val).toUpperCase()}</Text>
                        <Text style={[s.condLabel, { color: '#AAAAAA' }]}>{p.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <GridLine />
              </>
            )}

            {/* ── DECREE SECTION ── */}
            <SectionBar label="THE ORACLE RULES" bg={red} textColor={white} />
            <Panel bg={white} style={{ padding: 16 }}>
              <Text style={s.decreeVibe}>{verdict.vibe.toUpperCase()}</Text>
              <Text style={s.decreeText}>{verdict.verdict}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View
                    key={i}
                    style={{
                      width: 28, height: 4,
                      backgroundColor: i <= verdict.rating ? red : '#E0E0E0',
                    }}
                  />
                ))}
                <Text style={s.ratingLabel}>{verdict.rating}/5</Text>
              </View>
            </Panel>

            {/* ── LOOK SECTION ── */}
            <SectionBar label="WEAR THIS" bg={blue} textColor={white} />
            {verdict.outfits.map((item, i) => (
              <OutfitRow key={i} item={item} />
            ))}
            <GridLine />

            {/* ── AVOID SECTION ── */}
            {verdict.avoid?.length > 0 && (
              <>
                <SectionBar label="LEAVE BEHIND" bg={yellow} textColor={black} />
                <Panel bg={white} style={{ padding: 16 }}>
                  {verdict.avoid.map((a, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                      <View style={{ width: 4, height: 4, backgroundColor: red, marginTop: 5 }} />
                      <Text style={s.avoidText}>{a}</Text>
                    </View>
                  ))}
                </Panel>
              </>
            )}

            {/* ── REFRESH ── */}
            <View style={s.refreshRow}>
              {hoursAgo !== null && (
                <Text style={s.refreshMeta}>
                  {hoursAgo === 0 ? 'Just now' : `${hoursAgo}h ago`} · {cachedCity}
                </Text>
              )}
              <Pressable
                onPress={() => { if (cachedCity) oracle.consult(cachedCity, 'Women', profile); }}
                disabled={isLoading}
              >
                <Text style={[s.refreshBtn, isLoading && { opacity: 0.4 }]}>
                  {isLoading ? 'CONSULTING...' : '↻ REFRESH'}
                </Text>
              </Pressable>
            </View>

          </Animated.View>
        ) : isLoading ? (
          <View style={s.emptyState}>
            <SectionBar label="CONSULTING THE GRID" bg={red} textColor={white} />
            <Panel bg={yellow} style={{ padding: 24, alignItems: 'center' }}>
              <Text style={s.loadingText}>LOADING{'\n'}WEATHER DATA</Text>
            </Panel>
            <GridLine />
          </View>
        ) : (
          <View style={s.emptyState}>
            <SectionBar label="NO DATA YET" bg={black} textColor={white} />
            <Panel bg={white} style={{ padding: 20 }}>
              <Text style={s.emptyText}>Visit the Oracle tab to get your daily verdict.</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Oracle');
                }}
                style={s.ctaBtn}
              >
                <Text style={s.ctaBtnText}>CONSULT THE ORACLE</Text>
              </Pressable>
            </Panel>
            <GridLine />
          </View>
        )}

        {/* ── WORD OF THE DAY ── */}
        <SectionBar label="WORD OF THE DAY" bg={yellow} textColor={black} />
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 6, backgroundColor: blue }} />
          <Panel bg={white} style={{ flex: 1, padding: 16 }}>
            <Text style={s.wotdWord}>{word.word.toUpperCase()}</Text>
            <Text style={s.wotdDef}>{word.definition}</Text>
          </Panel>
        </View>
        <GridLine />

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: white,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },

  // Header
  header: {
    backgroundColor: black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 18,
    color: white,
    letterSpacing: 3,
  },
  streakLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: yellow,
    letterSpacing: 2,
    marginTop: 2,
  },
  cityChip: {
    borderWidth: 1.5,
    borderColor: yellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cityChipText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: yellow,
    letterSpacing: 1.5,
  },

  // Date bar
  dateBar: {
    backgroundColor: yellow,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  dateText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: black,
    letterSpacing: 2,
  },

  scroll: { flex: 1, backgroundColor: white },
  content: { paddingBottom: 20 },

  // Hero weather
  heroRow: {
    flexDirection: 'row',
    minHeight: 130,
  },
  heroTemp: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 80,
    color: white,
    lineHeight: 82,
    letterSpacing: -4,
  },
  heroTempUnit: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    color: 'rgba(255,255,255,0.70)',
    marginTop: -10,
  },
  heroCondition: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 14,
    color: black,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroHighLow: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#333333',
    letterSpacing: 1,
  },
  heroFeels: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 1,
  },

  // Stat cells
  statLabel: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 26,
    lineHeight: 28,
  },
  statUnit: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 2,
  },

  // Decree
  decreeVibe: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 12,
    color: red,
    letterSpacing: 3,
    marginBottom: 8,
  },
  decreeText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    color: black,
    lineHeight: 20,
  },
  ratingLabel: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 1,
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
  avoidText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: black,
    flex: 1,
    lineHeight: 18,
  },

  // WOTD
  wotdWord: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 22,
    color: black,
    letterSpacing: 1,
    marginBottom: 6,
  },
  wotdDef: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#444444',
    lineHeight: 17,
  },

  // Conditions panel
  condValue: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 15,
    color: black,
    letterSpacing: -0.5,
  },
  condLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#777777',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  aqiValue: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 26,
    color: black,
    lineHeight: 28,
    letterSpacing: -1,
  },
  pollenCell: {
    flex: 1,
    borderWidth: 0,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },

  // Weekly forecast
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  dailyRowBorder: {
    borderBottomWidth: gridLine,
    borderBottomColor: black,
  },
  dailyDay: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: black,
    letterSpacing: 0.3,
    width: 36,
  },
  dailyCond: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#555555',
    flex: 1,
    letterSpacing: 0.3,
  },
  dailyPrecip: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: blue,
    width: 32,
    textAlign: 'right' as const,
    letterSpacing: 0.3,
  },
  dailyMax: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 15,
    color: black,
  },
  dailyMin: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 15,
    color: '#AAAAAA',
  },

  // Refresh row
  refreshRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: white,
    borderTopWidth: gridLine,
    borderTopColor: black,
  },
  refreshMeta: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#777777',
    letterSpacing: 0.5,
  },
  refreshBtn: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    color: black,
    letterSpacing: 2,
  },

  // Empty / loading states
  emptyState: { },
  loadingText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 22,
    color: black,
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 30,
  },
  emptyText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    color: black,
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaBtn: {
    backgroundColor: red,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: gridLine,
    borderColor: black,
  },
  ctaBtnText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 12,
    color: white,
    letterSpacing: 3,
  },
});
