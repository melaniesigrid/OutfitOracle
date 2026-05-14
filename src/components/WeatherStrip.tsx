import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherData } from '../services/weather';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useTempUnit } from '../contexts/TemperatureContext';

interface Props {
  weather: WeatherData;
}

export function WeatherStrip({ weather }: Props) {
  const { colors, fonts } = useTheme();
  const { formatTemp } = useTempUnit();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateX }] }]}>
      <View style={styles.rule} />
      <View style={styles.locationRow}>
        <View style={styles.locationLeft}>
          <Text style={styles.locationName}>{weather.city}, {weather.country}</Text>
          <Text style={styles.condition}>{weather.conditionLabel.toUpperCase()}</Text>
        </View>
        <MaterialCommunityIcons
          name={weather.conditionIcon as any}
          size={32}
          color={colors.textMuted}
        />
      </View>
      <Text style={styles.tempHero}>{formatTemp(weather.temp)}</Text>
      <Text style={styles.metaLine}>
        {'FEELS ' + formatTemp(weather.feelsLike) + '  ·  HUMIDITY ' + weather.humidity + '%  ·  WIND ' + weather.windSpeed + ' km/h'}
      </Text>
      <View style={styles.rule} />
    </Animated.View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.xl,
    },
    rule: {
      height: 1,
      backgroundColor: colors.borderHard,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    locationLeft: {
      flex: 1,
    },
    locationName: {
      fontFamily: fonts.display,
      fontSize: 22,
      color: colors.textPrimary,
      lineHeight: 26,
      letterSpacing: -0.3,
    },
    condition: {
      fontFamily: fonts.mono,
      fontSize: 9,
      color: colors.textMuted,
      letterSpacing: 2,
      marginTop: 3,
    },
    tempHero: {
      fontFamily: fonts.displayLight,
      fontSize: 84,
      color: colors.textPrimary,
      letterSpacing: -3,
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
    },
    metaLine: {
      fontFamily: fonts.mono,
      fontSize: 9,
      color: colors.textMuted,
      letterSpacing: 1.5,
      marginBottom: spacing.md,
    },
  });
}
