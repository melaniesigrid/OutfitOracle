import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeatherData } from '../services/weather';
import { OracleVerdict } from '../services/oracle';
import { colors, fonts } from '../theme';

interface Props {
  weather: WeatherData;
  verdict: OracleVerdict;
  occasion?: string;
}

const ACCENT: Record<string, string> = {
  mint:     colors.mint,
  lavender: colors.lavender,
  coral:    colors.coral,
  lemon:    colors.lemon,
  iris:     colors.iris,
};

const CARD_W = 390;
const CARD_H = 780;

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).toUpperCase();
}

export const ShareCard = forwardRef<View, Props>(({ weather, verdict, occasion }, ref) => {
  const ratingFull  = Math.min(Math.max(verdict.rating ?? 3, 1), 5);
  const ratingEmpty = 5 - ratingFull;
  const effortLabel = ['', 'MINIMAL', 'EASY', 'CONSIDERED', 'POLISHED', 'FULL LOOK'][ratingFull];

  return (
    <View ref={ref} style={styles.card} collapsable={false}>

      {/* ── Masthead ─────────────────────────────────────────────── */}
      <View style={styles.masthead}>
        <View style={styles.mastheadTop}>
          <View style={styles.mastheadWordmark}>
            <Text style={styles.mastheadLight}>OUTFIT</Text>
            <Text style={styles.mastheadBold}>Oracle</Text>
          </View>
          <View style={styles.mastheadMeta}>
            <Text style={styles.mastheadCity}>
              {weather.city.toUpperCase()}, {weather.country.toUpperCase()}
            </Text>
            {occasion && occasion !== 'Any' && (
              <Text style={styles.mastheadOccasion}>{occasion.toUpperCase()}</Text>
            )}
          </View>
        </View>
        <Text style={styles.mastheadDate}>{formatDate()}</Text>
      </View>

      {/* ── Scarlet rule ─────────────────────────────────────────── */}
      <View style={styles.scarletRule} />

      {/* ── Body ─────────────────────────────────────────────────── */}
      <View style={styles.body}>

        {/* Vibe */}
        <Text style={styles.sectionLabel}>TODAY'S VIBE</Text>
        <Text style={styles.vibeName}>{verdict.vibe}</Text>

        {/* Verdict quote */}
        <View style={styles.verdictBlock}>
          <View style={styles.verdictAccent} />
          <Text style={styles.verdictText}>{verdict.verdict}</Text>
        </View>

        <View style={styles.rule} />

        {/* Weather strip */}
        <View style={styles.weatherRow}>
          <View style={styles.weatherTempBlock}>
            <Text style={styles.weatherTemp}>{weather.temp}°</Text>
            <Text style={styles.weatherFeels}>FEELS {weather.feelsLike}°C</Text>
          </View>
          <View style={styles.weatherDetails}>
            <Text style={styles.weatherCondition}>{weather.conditionLabel.toUpperCase()}</Text>
            <Text style={styles.weatherStat}>{weather.humidity}% HUMIDITY</Text>
            <Text style={styles.weatherStat}>{weather.windSpeed} KM/H WIND</Text>
          </View>
        </View>

        <View style={styles.rule} />

        {/* The Look — all 5 items */}
        <Text style={styles.sectionLabel}>THE LOOK</Text>
        {verdict.outfits.map((item, i) => (
          <View key={item.category} style={styles.outfitRow}>
            <Text style={styles.outfitNum}>{String(i + 1).padStart(2, '0')}</Text>
            <View style={[styles.outfitAccentBar, { backgroundColor: ACCENT[item.accentColor] ?? colors.mint }]} />
            <View style={styles.outfitTexts}>
              <Text style={[styles.outfitCategory, { color: ACCENT[item.accentColor] ?? colors.mint }]}>
                {item.category.toUpperCase()}
              </Text>
              <Text style={styles.outfitItem} numberOfLines={1}>{item.item}</Text>
            </View>
          </View>
        ))}

        {/* Avoid */}
        {verdict.avoid?.length > 0 && (
          <>
            <View style={styles.rule} />
            <Text style={styles.avoidLabel}>THE ORACLE FORBIDS</Text>
            <View style={styles.avoidRow}>
              {verdict.avoid.map(a => (
                <View key={a} style={styles.avoidChip}>
                  <Text style={styles.avoidText}>{a.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.rule} />

        {/* Rating + CTA row */}
        <View style={styles.bottomRow}>
          <View>
            <View style={styles.ratingDots}>
              {Array.from({ length: ratingFull  }).map((_, i) => <View key={`f${i}`} style={styles.dotFull} />)}
              {Array.from({ length: ratingEmpty }).map((_, i) => <View key={`e${i}`} style={styles.dotEmpty} />)}
            </View>
            <Text style={styles.effortLabel}>{effortLabel} EFFORT</Text>
          </View>

          <View style={styles.cta}>
            <Text style={styles.ctaLine}>Get your verdict →</Text>
            <Text style={styles.ctaApp}>Outfit Oracle</Text>
          </View>
        </View>

      </View>

      {/* ── Footer bar ───────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerTagline}>YOUR UNSOLICITED STYLE AUTHORITY</Text>
        <Text style={styles.footerUrl}>melaniesigrid.github.io/OutfitOracle/</Text>
      </View>
      <View style={styles.scarletBar} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width:           CARD_W,
    height:          CARD_H,
    backgroundColor: colors.bg,
    overflow:        'hidden',
  },

  // Masthead
  masthead: {
    backgroundColor: colors.bgDark,
    paddingHorizontal: 26,
    paddingTop:        22,
    paddingBottom:     18,
  },
  mastheadTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   10,
  },
  mastheadWordmark: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap: 7,
  },
  mastheadLight: {
    fontFamily:    fonts.displayLight,
    fontSize:      22,
    color:         '#FAF9F6',
    letterSpacing: 5,
  },
  mastheadBold: {
    fontFamily:    fonts.display,
    fontSize:      34,
    color:         '#FAF9F6',
    letterSpacing: -1.5,
    lineHeight:    36,
  },
  mastheadMeta: {
    alignItems: 'flex-end',
    paddingTop:  4,
  },
  mastheadCity: {
    fontFamily:    fonts.mono,
    fontSize:      9,
    color:         '#FAF9F6',
    letterSpacing: 1.5,
    opacity:       0.85,
  },
  mastheadOccasion: {
    fontFamily:    fonts.mono,
    fontSize:      8,
    color:         colors.scarlet,
    letterSpacing: 1.5,
    marginTop:     3,
  },
  mastheadDate: {
    fontFamily:    fonts.mono,
    fontSize:      8,
    color:         '#FAF9F6',
    letterSpacing: 1,
    opacity:       0.5,
  },

  scarletRule: {
    height:          3,
    backgroundColor: colors.scarlet,
  },

  // Body
  body: {
    flex:              1,
    paddingHorizontal: 26,
    paddingTop:        18,
    paddingBottom:     14,
  },
  sectionLabel: {
    fontFamily:    fonts.mono,
    fontSize:      8,
    letterSpacing: 2.5,
    color:         colors.textMuted,
    marginBottom:  6,
  },
  vibeName: {
    fontFamily:    fonts.display,
    fontSize:      32,
    color:         colors.textPrimary,
    lineHeight:    36,
    letterSpacing: -0.5,
    marginBottom:  12,
  },

  // Verdict quote
  verdictBlock: {
    flexDirection: 'row',
    gap:           10,
    marginBottom:  14,
  },
  verdictAccent: {
    width:           2,
    backgroundColor: colors.scarlet,
    borderRadius:    1,
    flexShrink:      0,
  },
  verdictText: {
    flex:          1,
    fontFamily:    fonts.serif,
    fontSize:      13,
    color:         colors.textSecondary,
    lineHeight:    20,
    letterSpacing: -0.1,
    fontStyle:     'italic',
  },

  rule: {
    height:          1,
    backgroundColor: colors.border,
    marginVertical:  12,
  },

  // Weather
  weatherRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           16,
  },
  weatherTempBlock: {
    alignItems: 'center',
  },
  weatherTemp: {
    fontFamily:    fonts.display,
    fontSize:      48,
    color:         colors.textPrimary,
    lineHeight:    50,
    letterSpacing: -2,
  },
  weatherFeels: {
    fontFamily:    fonts.mono,
    fontSize:      7,
    color:         colors.textMuted,
    letterSpacing: 0.5,
    marginTop:     2,
  },
  weatherDetails: {
    flex:       1,
    paddingTop: 6,
    gap:        3,
  },
  weatherCondition: {
    fontFamily:    fonts.displayBold,
    fontSize:      16,
    color:         colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight:    19,
  },
  weatherStat: {
    fontFamily:    fonts.mono,
    fontSize:      9,
    color:         colors.textMuted,
    letterSpacing: 0.5,
  },

  // Outfit list
  outfitRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginBottom:  8,
  },
  outfitNum: {
    fontFamily:  fonts.displayLight,
    fontSize:    18,
    color:       colors.textPrimary,
    opacity:     0.12,
    width:       24,
    textAlign:   'right',
    lineHeight:  20,
  },
  outfitAccentBar: {
    width:        2,
    height:       28,
    borderRadius: 1,
    flexShrink:   0,
  },
  outfitTexts: {
    flex: 1,
  },
  outfitCategory: {
    fontFamily:    fonts.mono,
    fontSize:      7,
    letterSpacing: 2,
    marginBottom:  1,
  },
  outfitItem: {
    fontFamily:    fonts.display,
    fontSize:      16,
    color:         colors.textPrimary,
    lineHeight:    19,
    letterSpacing: -0.2,
  },

  // Avoid
  avoidLabel: {
    fontFamily:    fonts.mono,
    fontSize:      8,
    letterSpacing: 2.5,
    color:         colors.scarlet,
    marginBottom:  7,
  },
  avoidRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           5,
  },
  avoidChip: {
    borderWidth:   1,
    borderColor:   colors.scarlet,
    paddingHorizontal: 7,
    paddingVertical:   3,
  },
  avoidText: {
    fontFamily:    fonts.mono,
    fontSize:      7,
    color:         colors.scarlet,
    letterSpacing: 1,
  },

  // Bottom row
  bottomRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  ratingDots: {
    flexDirection: 'row',
    gap:           3,
    marginBottom:  5,
  },
  dotFull: {
    width:           14,
    height:          3,
    backgroundColor: colors.textPrimary,
  },
  dotEmpty: {
    width:           14,
    height:          3,
    backgroundColor: colors.border,
  },
  effortLabel: {
    fontFamily:    fonts.mono,
    fontSize:      7,
    color:         colors.textMuted,
    letterSpacing: 1.5,
  },
  cta: {
    alignItems: 'flex-end',
  },
  ctaLine: {
    fontFamily:    fonts.mono,
    fontSize:      9,
    color:         colors.scarlet,
    letterSpacing: 0.5,
    marginBottom:  2,
  },
  ctaApp: {
    fontFamily:    fonts.display,
    fontSize:      17,
    color:         colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Footer
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingHorizontal: 26,
    paddingVertical:   10,
    backgroundColor: colors.bgSurface,
    borderTopWidth:  1,
    borderTopColor:  colors.border,
  },
  footerTagline: {
    fontFamily:    fonts.mono,
    fontSize:      7,
    color:         colors.textMuted,
    letterSpacing: 1,
  },
  footerUrl: {
    fontFamily:    fonts.mono,
    fontSize:      8,
    color:         colors.textPrimary,
    letterSpacing: 0.5,
  },

  scarletBar: {
    height:          4,
    backgroundColor: colors.scarlet,
  },
});
