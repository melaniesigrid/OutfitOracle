import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors, AppFonts } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { isStylePassportLandmark } from '../data/fashionCapitals';

interface Props {
  city: string;
  country: string;
  vibe: string;
  visitCount: number;
  descriptor: string | null;
  tempLabel: string;
  conditionLabel: string;
  consultedAt?: number;
}

const CARD_W = 540;
const CARD_H = 960;
const GOLD   = '#C4943A';

function formatVisitDate(ts?: number): string {
  const d = ts ? new Date(ts) : new Date();
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
}

function visitLabel(n: number): string {
  if (n === 1) return '1 visit';
  if (n <= 12) return `${n} visits`;
  return `${n} visits and counting`;
}

export const PassportPageCard = forwardRef<View, Props>(
  ({ city, country, vibe, visitCount, descriptor, tempLabel, conditionLabel, consultedAt }, ref) => {
    const { colors, fonts } = useTheme();
    const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
    const isLandmark = isStylePassportLandmark(city);

  return (
    <View ref={ref} style={[styles.card, isLandmark && styles.cardGold]} collapsable={false}>

      {/* ── Masthead ── */}
      <View style={styles.masthead}>
        <Text style={styles.wordmark}>OUTFIT ORACLE</Text>
        {isLandmark && <Text style={styles.capitalBadge}>STYLE LANDMARK</Text>}
      </View>

      {/* ── City hero ── */}
      <View style={styles.hero}>
        <Text style={styles.cityName} numberOfLines={1} adjustsFontSizeToFit>{city}</Text>
        <Text style={styles.country}>{country.toUpperCase()}</Text>
      </View>

      <View style={[styles.rule, isLandmark && styles.ruleGold]} />

      {/* ── Descriptor ── */}
      <View style={styles.descriptorBlock}>
        {descriptor ? (
          <Text style={styles.descriptor} numberOfLines={3}>{descriptor}</Text>
        ) : (
          <Text style={styles.descriptor}>{city} — a city the Oracle has noted.</Text>
        )}
      </View>

      <View style={[styles.rule, isLandmark && styles.ruleGold]} />

      {/* ── Oracle data row ── */}
      <View style={styles.dataRow}>
        <View style={styles.dataCell}>
          <Text style={styles.dataLabel}>VIBE</Text>
          <Text style={styles.dataValue} numberOfLines={2}>{vibe}</Text>
        </View>
        <View style={styles.dataDivider} />
        <View style={styles.dataCell}>
          <Text style={styles.dataLabel}>CONDITIONS</Text>
          <Text style={styles.dataValue}>{tempLabel} · {conditionLabel.toUpperCase()}</Text>
        </View>
      </View>

      {/* ── Footer ── */}
      <View style={[styles.rule, isLandmark && styles.ruleGold]} />
      <View style={styles.footer}>
        <Text style={styles.footerVisits}>{visitLabel(visitCount)}</Text>
        <Text style={styles.footerDate}>{formatVisitDate(consultedAt)}</Text>
      </View>

    </View>
  );
});

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    card: {
      width:           CARD_W,
      height:          CARD_H,
      backgroundColor: colors.bg,
      borderWidth:     1,
      borderColor:     colors.border,
      padding:         40,
      justifyContent:  'space-between',
    },
    cardGold: {
      borderColor: GOLD,
      borderWidth: 2,
    },
    masthead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    wordmark: {
      fontFamily: fonts.mono,
      fontSize:   11,
      letterSpacing: 3,
      color:      colors.textMuted,
    },
    capitalBadge: {
      fontFamily: fonts.mono,
      fontSize:   9,
      letterSpacing: 1.5,
      color:      GOLD,
    },
    hero: {
      gap: 6,
    },
    cityName: {
      fontFamily:   fonts.display,
      fontSize:     72,
      lineHeight:   72,
      color:        colors.textPrimary,
      letterSpacing: -2,
    },
    country: {
      fontFamily:   fonts.mono,
      fontSize:     12,
      letterSpacing: 3,
      color:        colors.textMuted,
    },
    rule: {
      height:          1,
      backgroundColor: colors.border,
    },
    ruleGold: {
      backgroundColor: GOLD,
      opacity: 0.4,
    },
    descriptorBlock: {
      paddingVertical: 8,
    },
    descriptor: {
      fontFamily:  fonts.serif,
      fontSize:    17,
      fontStyle:   'italic',
      color:       colors.textSecondary,
      lineHeight:  24,
    },
    dataRow: {
      flexDirection:  'row',
      alignItems:     'flex-start',
      gap: 24,
    },
    dataCell: {
      flex: 1,
      gap: 4,
    },
    dataDivider: {
      width: 1,
      backgroundColor: colors.border,
      alignSelf: 'stretch',
    },
    dataLabel: {
      fontFamily:   fonts.mono,
      fontSize:     9,
      letterSpacing: 2,
      color:        colors.textMuted,
    },
    dataValue: {
      fontFamily: fonts.display,
      fontSize:   20,
      color:      colors.textPrimary,
      lineHeight: 24,
      letterSpacing: -0.3,
    },
    footer: {
      gap: 4,
    },
    footerVisits: {
      fontFamily:   fonts.mono,
      fontSize:     10,
      letterSpacing: 2,
      color:        colors.textMuted,
    },
    footerDate: {
      fontFamily:   fonts.mono,
      fontSize:     10,
      letterSpacing: 1.5,
      color:        colors.textMuted,
    },
  });
}
