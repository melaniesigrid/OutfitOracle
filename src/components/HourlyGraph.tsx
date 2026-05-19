import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GRAPH_COL_W  = 64;
const GRAPH_H      = 110;
const GRAPH_TOP    = 44;
const GRAPH_BOTTOM = 36; // extra room so shifted precip never clips

const TIME_LABEL_H = 14; // approx rendered height of 11px mono text
const TEMP_LABEL_H = 14;
const ICON_SIZE    = 16;
const ICON_GAP     = 4;  // min gap between time label bottom and icon top
const MIN_ICON_TOP = TIME_LABEL_H + ICON_GAP;

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

/** Returns a condition-specific icon color, falling back to the theme's iconColor. */
function conditionIconColor(icon: string, fallback: string): string {
  switch (icon) {
    case 'weather-sunny':
    case 'weather-partly-cloudy':
      return '#F59E0B'; // amber — sun present
    case 'weather-lightning-rainy':
      return '#A78BFA'; // soft purple — thunder
    case 'weather-hail':
      return '#67E8F9'; // cyan — hail
    case 'weather-snowy-heavy':
    case 'weather-snowy':
      return '#93C5FD'; // light blue — snow
    case 'weather-snowy-rainy':
      return '#7DD3FC'; // sky blue — mixed precipitation
    case 'weather-pouring':
      return '#3B82F6'; // blue — heavy rain
    case 'weather-rainy':
    case 'weather-partly-rainy':
      return '#60A5FA'; // lighter blue — light/moderate rain
    case 'weather-fog':
      return '#9CA3AF'; // muted gray — fog
    case 'weather-cloudy':
    default:
      return fallback;  // cloudy/overcast/wind — use theme color
  }
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

  // Natural bottom position for precip labels
  const precipNatural = totalH - GRAPH_BOTTOM + 4;

  const lines = hours.slice(0, -1).map((h, i) => {
    const x1 = xFor(i);     const y1 = yFor(h.temp);
    const x2 = xFor(i + 1); const y2 = yFor(hours[i + 1].temp);
    const dx = x2 - x1;     const dy = y2 - y1;
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

          // Icon: normally cy-26 above dot, clamped so it never overlaps the time label
          const iconTop = Math.max(cy - ICON_SIZE - ICON_GAP - 4, MIN_ICON_TOP);

          // Temp label: just below the dot
          const tempTop = cy + 6;

          // Precip: pinned to the natural bottom row, but pushed down if the temp
          // label would collide with it (curve is near the bottom of the graph)
          const precipTop = Math.max(precipNatural, tempTop + TEMP_LABEL_H + 3);

          const ic = conditionIconColor(h.conditionIcon, iconColor);

          return (
            <React.Fragment key={i}>

              {/* Time label — always at top */}
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

              {/* Icon — condition-colored, clamped below the time label */}
              <MaterialCommunityIcons
                name={iconFn(h.conditionIcon) as any}
                size={ICON_SIZE}
                color={ic}
                style={{ position: 'absolute', left: cx - ICON_SIZE / 2, top: iconTop }}
              />

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

              {/* Temp label — just below the dot */}
              <Text style={{
                position: 'absolute',
                left: cx - GRAPH_COL_W / 2,
                top: tempTop,
                width: GRAPH_COL_W,
                textAlign: 'center',
                fontFamily: monoFont,
                fontSize: 11,
                color: textHigh,
                letterSpacing: -0.3,
              }}>{fmt(h.temp)}°</Text>

              {/* Precip % — bottom row, shifted down when it would overlap temp */}
              {h.precipProb > 0 && (
                <Text style={{
                  position: 'absolute',
                  left: cx - GRAPH_COL_W / 2,
                  top: precipTop,
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
