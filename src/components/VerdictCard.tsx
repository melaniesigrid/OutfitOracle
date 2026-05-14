import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OracleVerdict } from '../services/oracle';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  verdict: OracleVerdict;
}

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function vibeIcons(vibe: string): MCIName[] {
  const v = vibe.toLowerCase();
  const icons: MCIName[] = [];

  if (/rain|wet|drizzle|storm|cloud/.test(v))   icons.push('weather-rainy');
  if (/snow|winter|icy|frost|frozen/.test(v))    icons.push('snowflake');
  if (/sun|summer|warm|hot|bright/.test(v))      icons.push('white-balance-sunny');
  if (/wind|breezy|gust/.test(v))                icons.push('weather-windy');
  if (/fog|mist|haze/.test(v))                   icons.push('weather-fog');
  if (/night|dark|moon|mid/.test(v))             icons.push('weather-night');
  if (/chic|elegant|luxe|glam|vogue/.test(v))    icons.push('star-four-points');
  if (/cozy|comfort|casual|lazy|soft/.test(v))   icons.push('sofa-outline');
  if (/city|urban|street|metro/.test(v))         icons.push('city-variant-outline');
  if (/apoc|chaos|dramatic|fierce|savage/.test(v)) icons.push('lightning-bolt');
  if (/main character|boss|power/.test(v))       icons.push('crown-outline');
  if (/intell|academ|scholar|book/.test(v))      icons.push('book-open-variant');

  // Always include a fashion anchor
  icons.push('hanger');

  return icons.slice(0, 3);
}

export function VerdictCard({ verdict }: Props) {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const filled = verdict.rating;
  const icons = vibeIcons(verdict.vibe);

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      {/* Eyebrow */}
      <View style={styles.eyebrow}>
        <View style={styles.eyebrowLine} />
        <Text style={styles.eyebrowText}>THE ORACLE SPEAKS</Text>
        <View style={styles.eyebrowLine} />
      </View>

      {/* Pull quote */}
      <Text style={styles.verdictText}>"{verdict.verdict}"</Text>

      <View style={styles.rule} />

      {/* Vibe + rating */}
      <View style={styles.metaRow}>
        <View style={styles.vibeBlock}>
          <Text style={styles.metaLabel}>TODAY'S VIBE</Text>
          <Text style={styles.vibeName}>{verdict.vibe}</Text>
          <View style={styles.vibeIcons}>
            {icons.map((name, i) => (
              <MaterialCommunityIcons
                key={i}
                name={name}
                size={18}
                color={colors.textSecondary}
              />
            ))}
          </View>
        </View>
        <View style={styles.ratingBlock}>
          <Text style={styles.metaLabel}>EFFORT</Text>
          <View style={styles.ratingDashes}>
            {Array.from({ length: 5 }, (_, i) => (
              <View
                key={i}
                style={[styles.dash, i < filled ? styles.dashFilled : styles.dashEmpty]}
              />
            ))}
          </View>
          <Text style={styles.ratingNum}>{filled} / 5</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.xl,
    },
    eyebrow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    eyebrowLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderHard,
    },
    eyebrowText: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 2.5,
      color: colors.textMuted,
    },
    verdictText: {
      fontFamily: fonts.display,
      fontSize: 22,
      color: colors.textPrimary,
      lineHeight: 32,
      marginBottom: spacing.lg,
      letterSpacing: -0.3,
    },
    rule: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingTop: spacing.xs,
    },
    vibeBlock: {
      flex: 1,
    },
    ratingBlock: {
      alignItems: 'flex-end',
    },
    metaLabel: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 2,
      color: colors.textMuted,
      marginBottom: 6,
    },
    vibeName: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      color: colors.textPrimary,
      lineHeight: 22,
      marginBottom: 8,
    },
    vibeIcons: {
      flexDirection: 'row',
      gap: 10,
    },
    ratingDashes: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: 6,
    },
    dash: {
      width: 18,
      height: 3,
    },
    dashFilled: {
      backgroundColor: colors.textPrimary,
    },
    dashEmpty: {
      backgroundColor: colors.border,
    },
    ratingNum: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1,
    },
  });
}
