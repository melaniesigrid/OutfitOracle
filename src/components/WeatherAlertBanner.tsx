import React from 'react';
import { View, Text, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherAlert, WeatherData, uvLabel } from '../services/weather';
import { spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useTempUnit } from '../contexts/TemperatureContext';

interface Props {
  alerts?: WeatherAlert[];
  weather?: WeatherData;
  style?: StyleProp<ViewStyle>;
}

function alertColor(severity: WeatherAlert['severity']): string {
  switch (severity) {
    case 'Extreme':
    case 'Red':
      return '#DC2626';
    case 'Severe':
    case 'Orange':
      return '#EA580C';
    case 'Moderate':
    case 'Yellow':
      return '#CA8A04';
    case 'Minor':
    case 'Grey':
      return '#6B7280';
    default:
      return '#D97706';
  }
}

function alertLabel(alert: WeatherAlert): string {
  if (alert.severity === 'Unknown') return alert.event.toUpperCase();
  return `${alert.event.toUpperCase()} · ${alert.severity.toUpperCase()}`;
}

function isHeatAlert(event: string): boolean {
  return /heat|excessive|hot/i.test(event);
}

function peakHeatTime(hourly: WeatherData['hourly']): string | undefined {
  if (!hourly?.length) return undefined;
  const window = hourly.slice(0, 16);
  const peak = window.reduce((max, h) => (h.temp > max.temp ? h : max), window[0]);
  return peak.time;
}

export function WeatherAlertBanner({ alerts, weather, style }: Props) {
  const { colors, fonts } = useTheme();
  const { formatTemp } = useTempUnit();
  if (!alerts?.length) return null;

  return (
    <View style={[styles.wrapper, style]}>
      {alerts.map((alert, i) => {
        const color = alertColor(alert.severity);
        const showHeatStats = isHeatAlert(alert.event) && weather != null;
        const peakTime = showHeatStats ? peakHeatTime(weather!.hourly) : undefined;

        return (
          <View key={`${alert.event}-${i}`} style={[styles.row, { borderColor: color, backgroundColor: color + '18' }]}>
            <MaterialCommunityIcons name="thermometer-high" size={15} color={color} />
            <View style={styles.text}>
              <Text style={[styles.event, { fontFamily: fonts.mono, color }]} numberOfLines={1}>
                {alertLabel(alert)}
              </Text>
              <Text style={[styles.headline, { fontFamily: fonts.mono, color: colors.textPrimary }]} numberOfLines={2}>
                {alert.headline}
              </Text>
              <Text style={[styles.source, { fontFamily: fonts.mono, color: colors.textSecondary }]}>
                {alert.source}
              </Text>

              {showHeatStats && (
                <View style={[styles.statStrip, { borderTopColor: color + '40' }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { fontFamily: fonts.mono, color }]}>FEELS LIKE</Text>
                    <Text style={[styles.statValue, { fontFamily: fonts.mono, color: colors.textPrimary }]}>
                      {formatTemp(weather!.feelsLike)}°
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: color + '40' }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { fontFamily: fonts.mono, color }]}>HUMIDITY</Text>
                    <Text style={[styles.statValue, { fontFamily: fonts.mono, color: colors.textPrimary }]}>
                      {weather!.humidity}%
                    </Text>
                  </View>
                  {weather!.uvIndex !== undefined && (
                    <>
                      <View style={[styles.statDivider, { backgroundColor: color + '40' }]} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { fontFamily: fonts.mono, color }]}>UV</Text>
                        <Text style={[styles.statValue, { fontFamily: fonts.mono, color: colors.textPrimary }]}>
                          {uvLabel(weather!.uvIndex)}
                        </Text>
                      </View>
                    </>
                  )}
                  {peakTime && (
                    <>
                      <View style={[styles.statDivider, { backgroundColor: color + '40' }]} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { fontFamily: fonts.mono, color }]}>PEAKS</Text>
                        <Text style={[styles.statValue, { fontFamily: fonts.mono, color: colors.textPrimary }]}>
                          {peakTime}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.sm,
  },
  text: {
    flex: 1,
  },
  event: {
    fontSize: 10,
    letterSpacing: 1.8,
    marginBottom: 2,
  },
  headline: {
    fontSize: 12,
    lineHeight: 17,
  },
  source: {
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 4,
    opacity: 0.6,
  },
  statStrip: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 8,
    letterSpacing: 1.4,
  },
  statValue: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  statDivider: {
    width: 1,
    marginVertical: 2,
  },
});
