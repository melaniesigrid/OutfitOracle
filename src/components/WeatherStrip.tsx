import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherData } from '../services/weather';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  weather: WeatherData;
}

type Styles = ReturnType<typeof makeStyles>;

const Stat = ({
  label, value, sub, styles,
}: {
  label: string; value: string; sub?: string; styles: Styles;
}) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
  </View>
);

export function WeatherStrip({ weather }: Props) {
  const { colors, fonts } = useTheme();
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
          size={36}
          color={colors.textSecondary}
        />
      </View>
      <View style={styles.rule} />
      <View style={styles.statsRow}>
        <Stat label="TEMP" value={`${weather.temp}°C`} sub={`feels ${weather.feelsLike}°C`} styles={styles} />
        <View style={styles.divider} />
        <Stat label="HUMIDITY" value={`${weather.humidity}%`} sub="relative" styles={styles} />
        <View style={styles.divider} />
        <Stat label="WIND" value={`${weather.windSpeed}`} sub="km/h" styles={styles} />
      </View>
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
      paddingVertical: spacing.md,
    },
    locationLeft: {
      flex: 1,
    },
    locationName: {
      fontFamily: fonts.display,
      fontSize: 28,
      color: colors.textPrimary,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    condition: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 2,
      marginTop: 4,
    },
    statsRow: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    stat: {
      flex: 1,
      alignItems: 'center',
    },
    divider: {
      width: 1,
      height: 44,
      backgroundColor: colors.border,
    },
    statLabel: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 2,
      color: colors.textMuted,
      marginBottom: 4,
    },
    statValue: {
      fontFamily: fonts.displayBold,
      fontSize: 24,
      color: colors.textPrimary,
      lineHeight: 28,
    },
    statSub: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
}
