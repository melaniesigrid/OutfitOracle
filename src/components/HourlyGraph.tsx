import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GRAPH_COL_W  = 64;
const GRAPH_H      = 110;
const GRAPH_TOP    = 44;
const GRAPH_BOTTOM = 28;

export interface HourlyPoint {
  time: string;
  temp: number;       // raw Celsius from API
  conditionIcon: string;
  precipProb: number;
  uvIndex: number;
}

interface HourlyGraphProps {
  hours: HourlyPoint[];
  accentColor: string;
  textHigh: string;
  textFaint: string;
  lineColor: string;
  iconColor: string;
  monoFont: string;
  /** Map a base icon name to a theme-specific variant */
  themeIconFn?: (base: string) => string;
  /** Format a raw Celsius value for display. Defaults to `"${Math.round(c)}"` */
  formatTemp?: (celsius: number) => string;
  /** Optional dot color override — defaults to lineColor */
  dotColor?: string;
  /** Optional border-radius for the dot — set >0 for Y2K bubbly dots */
  dotRadius?: number;
}

export function HourlyGraph({
  hours,
  accentColor,
  textHigh,
  textFaint,
  lineColor,
  iconColor,
  monoFont,
  themeIconFn,
  formatTemp,
  dotColor,
  dotRadius = 3,
}: HourlyGraphProps) {
  const temps  = hours.map(h => h.temp);
  const minT   = Math.min(...temps);
  const maxT   = Math.max(...temps);
  const range  = Math.max(maxT - minT, 4);
  const totalH = GRAPH_TOP + GRAPH_H + GRAPH_BOTTOM;
  const totalW = hours.length * GRAPH_COL_W;

  const fmt    = formatTemp ?? ((c: number) => String(Math.round(c)));
  const iconFn = themeIconFn ?? ((s: string) => s);
  const dot    = dotColor ?? lineColor;

  function yFor(t: number) { return GRAPH_TOP + (1 - (t - minT) / range) * GRAPH_H; }
  function xFor(i: number) { return i * GRAPH_COL_W + GRAPH_COL_W / 2; }

  const lines = hours.slice(0, -1).map((h, i) => {
    const x1 = xFor(i);   const y1 = yFor(h.temp);
    const x2 = xFor(i + 1); const y2 = yFor(hours[i + 1].temp);
    const dx = x2 - x1;  const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x1, y1, len, angle, key: i };
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ width: totalW, height: totalH }}>

        {/* Connecting line segments */}
        {lines.map(l => (
          <View
            key={l.key}
            style={{
              position: 'absolute',
              left: l.x1,
              top: l.y1 - 0.75,
              width: l.len,
              height: 1.5,
              backgroundColor: lineColor,
              transformOrigin: '0% 50%',
              transform: [{ rotate: `${l.angle}deg` }],
            }}
          />
        ))}

        {/* Data points */}
        {hours.map((h, i) => {
          const cx = xFor(i);
          const cy = yFor(h.temp);
          return (
            <React.Fragment key={i}>
              {/* Dot */}
              <View style={{
                position: 'absolute',
                left: cx - 3,
                top: cy - 3,
                width: 6,
                height: 6,
                borderRadius: dotRadius,
                backgroundColor: dot,
              }} />

              {/* Time label */}
              <Text style={{
                position: 'absolute',
                left: cx - GRAPH_COL_W / 2,
                top: 0,
                width: GRAPH_COL_W,
                textAlign: 'center',
                fontFamily: monoFont,
                fontSize: 11,
                color: textFaint,
                letterSpacing: 0.3,
              }}>{h.time}</Text>

              {/* Icon above the curve */}
              <MaterialCommunityIcons
                name={iconFn(h.conditionIcon) as any}
                size={16}
                color={iconColor}
                style={{ position: 'absolute', left: cx - 8, top: cy - 26 }}
              />

              {/* Temp below the dot */}
              <Text style={{
                position: 'absolute',
                left: cx - GRAPH_COL_W / 2,
                top: cy + 6,
                width: GRAPH_COL_W,
                textAlign: 'center',
                fontFamily: monoFont,
                fontSize: 11,
                color: textHigh,
                letterSpacing: -0.3,
              }}>{fmt(h.temp)}°</Text>

              {/* Precip pinned to bottom */}
              {h.precipProb > 0 && (
                <Text style={{
                  position: 'absolute',
                  left: cx - GRAPH_COL_W / 2,
                  top: totalH - GRAPH_BOTTOM + 4,
                  width: GRAPH_COL_W,
                  textAlign: 'center',
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: accentColor,
                  letterSpacing: 0.2,
                }}>{h.precipProb}%</Text>
              )}
            </React.Fragment>
          );
        })}

      </View>
    </ScrollView>
  );
}
