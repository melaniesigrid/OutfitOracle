import React, { useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Platform, StatusBar, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppData } from '../contexts/AppContext';
import { colors, fonts, spacing } from '../theme';

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

export function TodayScreen() {
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

  const hoursAgo = cachedAt
    ? Math.round((Date.now() - cachedAt) / (1000 * 60 * 60))
    : null;

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
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>NEXT 24 HOURS</Text>
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
              </View>
            )}

            {/* ── UV / SUN / MOON ── */}
            {(weather.uvIndex !== undefined || weather.sunrise || weather.moonPhaseName) && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>CONDITIONS</Text>
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
                      <MaterialCommunityIcons
                        name="weather-sunset-up"
                        size={20}
                        color="rgba(250,249,246,0.50)"
                      />
                      <Text style={styles.condCardVal}>{weather.sunrise}</Text>
                      <Text style={styles.condCardLabel}>SUNRISE</Text>
                    </View>
                  )}
                  {weather.sunset && (
                    <View style={styles.condCard}>
                      <MaterialCommunityIcons
                        name="weather-sunset-down"
                        size={20}
                        color="rgba(250,249,246,0.50)"
                      />
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
              </View>
            )}

            {/* ── 7-DAY FORECAST ── */}
            {!!weather.daily?.length && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>7-DAY FORECAST</Text>
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
              </View>
            )}

            {/* ── ALLERGENS & AIR QUALITY ── */}
            {weather.pollen && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>ALLERGENS & AIR</Text>
                <View style={styles.aqiRow}>
                  <View>
                    <Text style={styles.aqiVal}>{weather.pollen.aqi}</Text>
                    <Text style={styles.aqiLabel}>
                      AQI — {weather.pollen.aqiLabel.toUpperCase()}
                    </Text>
                  </View>
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
              </View>
            )}

            {/* ── VERDICT STRIP ── */}
            <View style={styles.verdictStrip}>
              <Text style={styles.verdictEyebrow}>— THE ORACLE SPEAKS —</Text>
              <Text style={styles.verdictPull} numberOfLines={3}>
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
            </View>

            {/* ── OUTFIT CHIPS ── */}
            <View style={styles.chipSection}>
              <Text style={styles.chipLabel}>TODAY'S LOOK</Text>
              <View style={styles.chips}>
                {verdict.outfits.slice(0, 3).map(item => (
                  <View key={item.category} style={styles.chip}>
                    <Text style={styles.chipCategory}>{item.category.toUpperCase()}</Text>
                    <Text style={styles.chipItem}>{item.item}</Text>
                  </View>
                ))}
              </View>
            </View>

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
                  {isLoading ? 'Consulting…' : '↻ Refresh verdict'}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },

  /* ── Weather hero ── */
  weatherHero: {
    backgroundColor: '#111009',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  heroLeft: {
    flex: 1,
  },
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

  /* ── Detail sections (shared) ── */
  detailSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(250,249,246,0.07)',
  },
  detailLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2.5,
    color: 'rgba(250,249,246,0.30)',
    marginBottom: spacing.md,
  },

  /* ── Hourly forecast ── */
  hourlyList: {
    gap: 4,
    paddingRight: spacing.md,
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

  /* ── Conditions (UV / sun / moon) ── */
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

  /* ── 7-day forecast ── */
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
  aqiRow: {
    marginBottom: spacing.md,
  },
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

  /* ── Verdict strip ── */
  verdictStrip: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verdictEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  verdictPull: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  verdictMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  verdictMetaLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 4,
  },
  verdictVibe: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  ratingBlock: {
    alignItems: 'flex-end',
  },
  ratingDashes: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dash: { width: 16, height: 3 },
  dashFilled: { backgroundColor: colors.textPrimary },
  dashEmpty:  { backgroundColor: colors.border },

  /* ── Outfit chips ── */
  chipSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  chipLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chips: {
    gap: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipCategory: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: colors.textMuted,
    width: 72,
  },
  chipItem: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    letterSpacing: -0.2,
  },

  /* ── Refresh row ── */
  refreshRow: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
    color: 'rgba(250,249,246,0.55)',
    letterSpacing: 0.5,
  },

  /* ── Empty state ── */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    borderTopColor: 'rgba(250,249,246,0.08)',
  },
  greetingSub: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.25)',
    letterSpacing: 0.3,
  },
});
