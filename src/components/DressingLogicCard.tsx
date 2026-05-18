import React, { useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherData } from '../services/weather';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

type TempFormatter = (celsius: number) => string;

interface Props {
  weather: WeatherData;
  formatTemp: TempFormatter;
  style?: StyleProp<ViewStyle>;
}

interface LogicPoint {
  id: string;
  icon: string;
  title: string;
  body: string;
}

function maxPrecip(weather: WeatherData): number {
  const hourlyMax = weather.hourly?.length
    ? Math.max(...weather.hourly.slice(0, 8).map(hour => hour.precipProb))
    : 0;
  return Math.max(hourlyMax, weather.daily?.[0]?.precipProb ?? 0);
}

function buildLogic(weather: WeatherData, formatTemp: TempFormatter): LogicPoint[] {
  const points: LogicPoint[] = [];
  const today = weather.daily?.[0];
  const apparentGap = Math.abs(weather.temp - weather.feelsLike);
  const precip = maxPrecip(weather);

  if (today) {
    const range = today.tempMax - today.tempMin;
    if (range >= 10) {
      points.push({
        id: 'swing',
        icon: 'swap-vertical',
        title: 'Temperature swing',
        body: `${formatTemp(today.tempMin)}° to ${formatTemp(today.tempMax)}° means removable layers matter more than one perfect piece.`,
      });
    } else if (range >= 6) {
      points.push({
        id: 'range',
        icon: 'layers-outline',
        title: 'Layer range',
        body: `From ${formatTemp(today.tempMin)}° to ${formatTemp(today.tempMax)}° calls for one flexible layer you can add or drop without rebuilding the outfit.`,
      });
    }
  }

  if (apparentGap >= 3) {
    points.push({
      id: 'feels',
      icon: 'thermometer-lines',
      title: 'Feels-like check',
      body: `It reads ${formatTemp(weather.temp)}° but feels like ${formatTemp(weather.feelsLike)}°; dress for the body feel, not the headline number.`,
    });
  }

  if (precip >= 60) {
    points.push({
      id: 'precip-high',
      icon: 'umbrella-outline',
      title: 'Wet-weather risk',
      body: `${precip}% precipitation risk makes waterproof shoes and a real outer layer the practical baseline.`,
    });
  } else if (precip >= 30) {
    points.push({
      id: 'precip-medium',
      icon: 'weather-partly-rainy',
      title: 'Rain hedge',
      body: `${precip}% precipitation risk is enough to carry a compact rain layer or choose shoes that can get splashed.`,
    });
  }

  if (weather.windSpeed >= 32) {
    points.push({
      id: 'wind-high',
      icon: 'weather-windy',
      title: 'Wind control',
      body: `${weather.windSpeed} km/h wind will punish loose volume; anchored hems and secure outerwear are the safer move.`,
    });
  } else if (weather.windSpeed >= 20) {
    points.push({
      id: 'wind-medium',
      icon: 'weather-windy',
      title: 'Breeze factor',
      body: `${weather.windSpeed} km/h wind makes a light jacket or structured layer earn its place.`,
    });
  }

  if (weather.humidity >= 75 && weather.temp >= 18) {
    points.push({
      id: 'humidity',
      icon: 'water-percent',
      title: 'Humidity',
      body: `${weather.humidity}% humidity favours breathable fabrics and fewer clingy layers.`,
    });
  }

  if ((weather.uvIndex ?? 0) >= 6) {
    points.push({
      id: 'uv',
      icon: 'white-balance-sunny',
      title: 'Sun exposure',
      body: `UV ${weather.uvIndex} makes sunglasses, coverage, or SPF part of the outfit logic.`,
    });
  }

  if (points.length === 0) {
    points.push({
      id: 'stable',
      icon: 'check-circle-outline',
      title: 'Stable read',
      body: 'No major weather trap stands out, so the outfit can lead with occasion and personal style.',
    });
  }

  return points.slice(0, 3);
}

export function DressingLogicCard({ weather, formatTemp, style }: Props) {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const points = useMemo(() => buildLogic(weather, formatTemp), [weather, formatTemp]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.headerRule} />
        <Text style={styles.headerText}>WHY THIS WORKS</Text>
        <View style={styles.headerRule} />
      </View>
      <View style={styles.points}>
        {points.map(point => (
          <View key={point.id} style={styles.point}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={point.icon as any} size={18} color={colors.scarletFg} />
            </View>
            <View style={styles.pointCopy}>
              <Text style={styles.pointTitle}>{point.title}</Text>
              <Text style={styles.pointBody}>{point.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.xl,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    headerRule: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    headerText: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 2.2,
      color: colors.textMuted,
    },
    points: {
      gap: spacing.md,
    },
    point: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    iconWrap: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSurface,
    },
    pointCopy: {
      flex: 1,
      minWidth: 0,
    },
    pointTitle: {
      fontFamily: fonts.monoMedium,
      fontSize: 12,
      lineHeight: 17,
      letterSpacing: 1.2,
      color: colors.textPrimary,
      marginBottom: 3,
      textTransform: 'uppercase',
    },
    pointBody: {
      fontFamily: fonts.serif,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
    },
  });
}
