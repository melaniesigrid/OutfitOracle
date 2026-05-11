import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeatherData } from '../services/weather';
import { OracleVerdict } from '../services/oracle';
import { colors, fonts } from '../theme';

interface Props {
  weather: WeatherData;
  verdict: OracleVerdict;
}

const ACCENT: Record<string, string> = {
  mint:     colors.mint,
  lavender: colors.lavender,
  coral:    colors.coral,
  lemon:    colors.lemon,
  iris:     colors.iris,
};

export const ShareCard = forwardRef<View, Props>(({ weather, verdict }, ref) => {
  const top3 = verdict.outfits.slice(0, 3);

  return (
    <View ref={ref} style={styles.card} collapsable={false}>

      {/* Masthead */}
      <View style={styles.masthead}>
        <Text style={styles.mastheadLight}>OUTFIT</Text>
        <Text style={styles.mastheadBold}>Oracle</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>

        {/* Vibe */}
        <Text style={styles.sectionLabel}>TODAY'S VIBE</Text>
        <Text style={styles.vibeName}>{verdict.vibe}</Text>

        <View style={styles.rule} />

        {/* Location + weather */}
        <Text style={styles.location}>
          {weather.city.toUpperCase()}, {weather.country.toUpperCase()}
        </Text>
        <Text style={styles.condition}>
          {weather.temp}°C · {weather.conditionLabel.toUpperCase()} · {weather.humidity}% HUMIDITY
        </Text>

        <View style={styles.rule} />

        {/* Top 3 outfits */}
        {top3.map(item => (
          <View key={item.category} style={styles.outfitRow}>
            <Text style={[styles.outfitCategory, { color: ACCENT[item.accentColor] ?? colors.mint }]}>
              {item.category.toUpperCase()}
            </Text>
            <Text style={styles.outfitItem} numberOfLines={1}>{item.item}</Text>
          </View>
        ))}

        <View style={styles.rule} />

        {/* Footer */}
        <Text style={styles.footer}>Outfit Oracle · Your unsolicited style authority</Text>
      </View>

      {/* Scarlet accent */}
      <View style={styles.scarletBar} />
    </View>
  );
});

const CARD_W = 375;
const CARD_H = 667;

const styles = StyleSheet.create({
  card: {
    width:           CARD_W,
    height:          CARD_H,
    backgroundColor: colors.bg,
    overflow:        'hidden',
  },
  masthead: {
    backgroundColor: colors.bgDark,
    paddingHorizontal: 28,
    paddingVertical:   22,
    flexDirection:     'row',
    alignItems:        'baseline',
    gap: 8,
  },
  mastheadLight: {
    fontFamily: fonts.displayLight,
    fontSize:   28,
    color:      '#FAF9F6',
    letterSpacing: 6,
  },
  mastheadBold: {
    fontFamily: fonts.display,
    fontSize:   42,
    color:      '#FAF9F6',
    letterSpacing: -2,
    lineHeight: 46,
  },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontFamily:    fonts.mono,
    fontSize:      9,
    letterSpacing: 2.5,
    color:         colors.textMuted,
    marginBottom:  8,
  },
  vibeName: {
    fontFamily:    fonts.display,
    fontSize:      34,
    color:         colors.textPrimary,
    lineHeight:    38,
    letterSpacing: -0.5,
    marginBottom:  20,
  },
  rule: {
    height:          1,
    backgroundColor: colors.border,
    marginBottom:    16,
  },
  location: {
    fontFamily:    fonts.mono,
    fontSize:      11,
    color:         colors.textPrimary,
    letterSpacing: 1.5,
    marginBottom:  4,
  },
  condition: {
    fontFamily:    fonts.mono,
    fontSize:      10,
    color:         colors.textMuted,
    letterSpacing: 0.5,
    marginBottom:  16,
  },
  outfitRow: {
    marginBottom: 14,
  },
  outfitCategory: {
    fontFamily:    fonts.mono,
    fontSize:      9,
    letterSpacing: 2.5,
    marginBottom:  3,
  },
  outfitItem: {
    fontFamily:    fonts.display,
    fontSize:      20,
    color:         colors.textPrimary,
    lineHeight:    24,
    letterSpacing: -0.3,
  },
  footer: {
    fontFamily:    fonts.mono,
    fontSize:      9,
    color:         colors.textMuted,
    letterSpacing: 0.5,
    marginTop:     'auto',
  },
  scarletBar: {
    height:          4,
    backgroundColor: colors.scarlet,
  },
});
