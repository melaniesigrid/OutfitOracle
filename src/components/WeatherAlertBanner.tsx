import React from 'react';
import { View, Text, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherAlert } from '../services/weather';
import { spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  alerts?: WeatherAlert[];
  style?: StyleProp<ViewStyle>;
}

function alertColor(severity: WeatherAlert['severity']): string {
  switch (severity) {
    case 'Extreme': return '#DC2626';
    case 'Severe':  return '#EA580C';
    case 'Minor':   return '#CA8A04';
    default:        return '#D97706';
  }
}

export function WeatherAlertBanner({ alerts, style }: Props) {
  const { colors, fonts } = useTheme();
  if (!alerts?.length) return null;

  return (
    <View style={style}>
      {alerts.map((alert, i) => {
        const color = alertColor(alert.severity);
        return (
          <View key={`${alert.event}-${i}`} style={[styles.row, { borderColor: color, backgroundColor: color + '18' }]}>
            <MaterialCommunityIcons name="thermometer-high" size={15} color={color} />
            <View style={styles.text}>
              <Text style={[styles.event, { fontFamily: fonts.mono, color }]} numberOfLines={1}>
                {alert.event.toUpperCase()}
              </Text>
              <Text style={[styles.headline, { fontFamily: fonts.mono, color: colors.textPrimary }]} numberOfLines={2}>
                {alert.headline}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
