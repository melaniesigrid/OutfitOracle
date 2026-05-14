import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherData } from '../../services/weather';
import { y2kTokens, spacing } from '../../theme';
import { Y2KCard } from './Y2KCard';
import { useTheme } from '../../contexts/ThemeContext';
import { getY2KTypography, Y2KTypography } from '../../theme/y2kTypography';

interface Props {
  weather: WeatherData;
  formatTemp?: (celsius: number) => string;
}

export function Y2KWeatherCard({ weather, formatTemp }: Props) {
  const { y2kFontSubtheme } = useTheme();
  const typo   = useMemo(() => getY2KTypography(y2kFontSubtheme), [y2kFontSubtheme]);
  const styles = useMemo(() => makeStyles(typo), [typo]);

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const displayTemp   = formatTemp ? formatTemp(weather.temp)       : String(Math.round(weather.temp));
  const displayFeels  = formatTemp ? formatTemp(weather.feelsLike)  : String(Math.round(weather.feelsLike));

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, styles.wrapper]}>
      <Y2KCard shadow>
        {/* Cream header — file info + location */}
        <View style={styles.header}>
          <View style={styles.fileHeader}>
            <Text style={styles.fileLabelLeft}>FOR THE RECORD ♡</Text>
            <Text style={styles.fileLabelRight}>// ON FILE</Text>
          </View>
          <View style={styles.rule} />

          <View style={styles.locationRow}>
            <View style={styles.locationLeft}>
              <Text style={styles.cityName}>{weather.city}, {weather.country}</Text>
              <Text style={styles.condition}>{weather.conditionLabel.toUpperCase()}</Text>
            </View>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons
                name={weather.conditionIcon as any}
                size={28}
                color={y2kTokens.cream}
              />
            </View>
          </View>
        </View>

        {/* Deep purple temperature block */}
        <View style={styles.tempBlock}>
          <Text style={styles.tempHero}>{displayTemp}°</Text>
          <Text style={styles.metaLine}>
            {'feels ' + displayFeels + '°  ·  ' + weather.humidity + '% humidity  ·  ' + weather.windSpeed + ' km/h'}
          </Text>
        </View>
      </Y2KCard>
    </Animated.View>
  );
}

function makeStyles(typo: Y2KTypography) { return StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  header: {
    padding: spacing.md,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fileLabelLeft: {
    fontFamily: typo.monoData.fontFamily,
    fontSize: 10,
    letterSpacing: 1.5,
    color: y2kTokens.hotPink,
  },
  fileLabelRight: {
    fontFamily: typo.monoLabel.fontFamily,
    fontSize: 10,
    letterSpacing: 2,
    color: y2kTokens.mutedPurple,
  },
  rule: {
    height: 1,
    backgroundColor: y2kTokens.deepPurple,
    marginBottom: spacing.md,
    opacity: 0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationLeft: {
    flex: 1,
  },
  cityName: {
    fontFamily: typo.displaySmall.fontFamily,
    fontSize: 18,
    color: y2kTokens.ink,
    letterSpacing: typo.displaySmall.letterSpacing,
  },
  condition: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.mutedPurple,
    letterSpacing: 2,
    marginTop: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: y2kTokens.deepPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Deep purple temperature panel — the color-block moment
  tempBlock: {
    backgroundColor: y2kTokens.deepPurple,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  tempHero: {
    fontFamily: typo.displayHero.fontFamily,
    fontSize: 80,
    color: y2kTokens.lime,
    lineHeight: 96,
    letterSpacing: typo.displayHero.letterSpacing,
  },
  metaLine: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    color: y2kTokens.cream,
    letterSpacing: 1,
    marginTop: 4,
    opacity: 0.7,
  },
}); }
