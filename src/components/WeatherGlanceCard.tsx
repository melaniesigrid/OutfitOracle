import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherData, uvLabel } from '../services/weather';
import { AppFonts, AppMetrics, isY2KTheme, spacing, weatherGlanceTokens } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useTempUnit } from '../contexts/TemperatureContext';
import { SunnyWeatherAnimation } from './SunnyWeatherAnimation';
import { HotWeatherAnimation } from './HotWeatherAnimation';
import { ColdWeatherAnimation } from './ColdWeatherAnimation';
import { formatLocationTimeWithCue } from '../utils/locationTime';

type WeatherGlanceMode = 'strip' | 'hero';
type TempFormatter = (celsius: number) => string;
type WeatherGlanceKind =
  | 'sunny'
  | 'hot'
  | 'cold'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'heavy-rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'wind'
  | 'night';

interface Props {
  weather: WeatherData;
  formatTemp?: (celsius: number) => string;
  mode?: WeatherGlanceMode;
  style?: StyleProp<ViewStyle>;
  lastConsultedAt?: number | null;
}

interface GlancePalette {
  skyTop: string;
  skyMid: string;
  skyLow: string;
  panel: string;
  panelStrong: string;
  border: string;
  sceneText: string;
  text: string;
  muted: string;
  faint: string;
  accent: string;
  glow: string;
  cloud: string;
  precipitation: string;
  silhouette: string;
  shadow: string;
}

interface GlanceCopy {
  summary: string;
  verdict: string;
  verdictIcon: string;
  statOneLabel: string;
  statOneValue: string;
  statOneIcon: string;
}

interface GlanceStat {
  label: string;
  value: string;
  icon: string;
}

const RAIN_DROPS = [
  { left: 9, top: -150, height: 64, opacity: 0.42 },
  { left: 16, top: -92, height: 82, opacity: 0.62 },
  { left: 24, top: -170, height: 58, opacity: 0.38 },
  { left: 33, top: -118, height: 90, opacity: 0.58 },
  { left: 43, top: -150, height: 64, opacity: 0.42 },
  { left: 52, top: -82, height: 84, opacity: 0.62 },
  { left: 62, top: -178, height: 66, opacity: 0.48 },
  { left: 71, top: -116, height: 94, opacity: 0.66 },
  { left: 81, top: -84, height: 62, opacity: 0.42 },
  { left: 90, top: -160, height: 84, opacity: 0.58 },
  { left: 5, top: -42, height: 72, opacity: 0.28 },
  { left: 29, top: -54, height: 74, opacity: 0.34 },
  { left: 39, top: -28, height: 56, opacity: 0.26 },
  { left: 57, top: -32, height: 68, opacity: 0.32 },
  { left: 76, top: -46, height: 76, opacity: 0.38 },
  { left: 96, top: -62, height: 58, opacity: 0.30 },
];

const SNOW_FLAKES = [
  { left: 8, top: -144, size: 5, opacity: 0.76 },
  { left: 18, top: -84, size: 8, opacity: 0.9 },
  { left: 30, top: -174, size: 5, opacity: 0.66 },
  { left: 39, top: -112, size: 9, opacity: 0.86 },
  { left: 49, top: -154, size: 6, opacity: 0.74 },
  { left: 59, top: -76, size: 7, opacity: 0.76 },
  { left: 69, top: -188, size: 9, opacity: 0.88 },
  { left: 79, top: -124, size: 5, opacity: 0.68 },
  { left: 88, top: -96, size: 8, opacity: 0.8 },
  { left: 95, top: -158, size: 5, opacity: 0.72 },
];

const STARS = [
  { left:  8, top:  8, size: 2 },
  { left: 17, top: 22, size: 3 },
  { left: 28, top: 10, size: 2 },
  { left: 38, top: 31, size: 2 },
  { left: 47, top: 14, size: 4 },
  { left: 55, top:  6, size: 2 },
  { left: 63, top: 26, size: 3 },
  { left: 72, top: 12, size: 2 },
  { left: 80, top: 35, size: 2 },
  { left: 88, top: 18, size: 3 },
  { left: 22, top: 40, size: 2 },
  { left: 44, top: 43, size: 2 },
  { left: 68, top: 38, size: 2 },
  { left: 93, top: 28, size: 2 },
];

const WIND_STREAKS = [
  { top: 92, width: 132, opacity: 0.44 },
  { top: 146, width: 202, opacity: 0.34 },
  { top: 224, width: 154, opacity: 0.28 },
  { top: 294, width: 230, opacity: 0.24 },
  { top: 348, width: 184, opacity: 0.18 },
];

const SUN_RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

const LIGHT_MOTES = [
  { left: 12, top: 118, size: 4, opacity: 0.34 },
  { left: 28, top: 210, size: 7, opacity: 0.22 },
  { left: 47, top: 158, size: 3, opacity: 0.30 },
  { left: 69, top: 238, size: 5, opacity: 0.28 },
  { left: 86, top: 172, size: 4, opacity: 0.32 },
];

const DISTANT_RAIN = [
  { left: 3, top: -210, height: 104, opacity: 0.18 },
  { left: 13, top: -188, height: 118, opacity: 0.22 },
  { left: 22, top: -230, height: 96, opacity: 0.16 },
  { left: 36, top: -202, height: 126, opacity: 0.24 },
  { left: 49, top: -218, height: 110, opacity: 0.18 },
  { left: 63, top: -196, height: 124, opacity: 0.22 },
  { left: 74, top: -236, height: 98, opacity: 0.17 },
  { left: 87, top: -204, height: 120, opacity: 0.23 },
  { left: 98, top: -224, height: 104, opacity: 0.18 },
];

const RAIN_RIPPLES = [
  { left: 18, bottom: 44, width: 38 },
  { left: 38, bottom: 70, width: 52 },
  { left: 65, bottom: 52, width: 44 },
  { left: 84, bottom: 92, width: 34 },
];

const SNOW_SPARKLES = [
  { left: 15, top: 92, size: 14 },
  { left: 35, top: 232, size: 10 },
  { left: 72, top: 164, size: 12 },
  { left: 88, top: 292, size: 9 },
];

const WIND_LEAVES = [
  { top: 128, left: 30, size: 10, rotate: '-22deg' },
  { top: 204, left: 78, size: 8, rotate: '18deg' },
  { top: 284, left: 48, size: 12, rotate: '-10deg' },
];

const WISPS = [
  { top: 108, left: -44, width: 190, opacity: 0.16 },
  { top: 256, left: 72, width: 230, opacity: 0.13 },
  { top: 370, left: -28, width: 210, opacity: 0.10 },
];

const FOREGROUND_RAIN = [
  { left: 6, top: -210, height: 154, opacity: 0.16 },
  { left: 19, top: -124, height: 190, opacity: 0.22 },
  { left: 36, top: -188, height: 160, opacity: 0.14 },
  { left: 55, top: -104, height: 198, opacity: 0.20 },
  { left: 73, top: -220, height: 172, opacity: 0.18 },
  { left: 91, top: -146, height: 188, opacity: 0.22 },
];

const FOREGROUND_SNOW = [
  { left: 10, top: -128, size: 7, opacity: 0.46 },
  { left: 26, top: -54, size: 10, opacity: 0.58 },
  { left: 42, top: -166, size: 6, opacity: 0.42 },
  { left: 63, top: -92, size: 12, opacity: 0.60 },
  { left: 82, top: -146, size: 8, opacity: 0.50 },
];

const FOREGROUND_GLINTS = [
  { left: 16, top: 192, size: 5 },
  { left: 52, top: 132, size: 4 },
  { left: 84, top: 252, size: 6 },
];

const FOREGROUND_WIND = [
  { top: 184, width: 180, opacity: 0.18 },
  { top: 318, width: 240, opacity: 0.14 },
];

function parseTimeMinutes(value?: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function isNightWeather(weather: WeatherData): boolean {
  const localH = weather.utcOffsetSeconds !== undefined
    ? Math.floor((Date.now() / 1000 + weather.utcOffsetSeconds) / 3600) % 24
    : new Date().getHours();
  const localM = weather.utcOffsetSeconds !== undefined
    ? Math.floor((Date.now() / 1000 + weather.utcOffsetSeconds) / 60) % 60
    : new Date().getMinutes();
  const currentMinutes = localH * 60 + localM;
  const sunrise = parseTimeMinutes(weather.sunrise);
  const sunset = parseTimeMinutes(weather.sunset);
  if (sunrise !== null && sunset !== null) {
    return currentMinutes < sunrise || currentMinutes > sunset;
  }
  return localH < 6 || localH >= 19;
}

function weatherKind(weather: WeatherData): WeatherGlanceKind {
  const icon = weather.conditionIcon.toLowerCase();
  const label = weather.conditionLabel.toLowerCase();
  const signal = `${icon} ${label}`;

  if (/lightning|storm|thunder|hail/.test(signal)) return 'storm';
  if (/snow/.test(signal)) return 'snow';
  if (/pouring|heavy rain|heavy showers|violent/.test(signal)) return 'heavy-rain';
  if (/rain|drizzle|showers/.test(signal)) return 'rain';
  if (/fog|hazy|mist|rime/.test(signal)) return 'fog';
  if (weather.windSpeed >= 36) return 'wind';
  if (weather.feelsLike >= 30) return 'hot';
  if (weather.feelsLike <= -8) return 'cold';
  if (isNightWeather(weather) && /clear|sunny|partly|cloud/.test(signal)) return 'night';
  if (/partly/.test(signal)) return 'partly-cloudy';
  if (/cloud|overcast/.test(signal)) return 'cloudy';
  return 'sunny';
}

function paletteFor(kind: WeatherGlanceKind): GlancePalette {
  const t = weatherGlanceTokens;
  switch (kind) {
    case 'hot':
      return {
        skyTop: '#7c2200',
        skyMid: '#d45010',
        skyLow: '#fabe68',
        panel: 'rgba(255,255,255,0.28)',
        panelStrong: 'rgba(255,255,255,0.36)',
        border: 'rgba(255,255,255,0.44)',
        sceneText: 'rgba(255,255,255,0.96)',
        text: '#25120a',
        muted: 'rgba(37,18,10,0.68)',
        faint: 'rgba(37,18,10,0.46)',
        accent: '#FFD166',
        glow: 'rgba(255,180,60,0.44)',
        cloud: 'rgba(255,255,255,0.38)',
        precipitation: 'rgba(255,180,60,0.72)',
        silhouette: 'rgba(60,12,0,0.72)',
        shadow: 'rgba(80,18,0,0.38)',
      };
    case 'cold':
      return {
        skyTop: '#050d1e',
        skyMid: '#1a4080',
        skyLow: '#6aadda',
        panel: 'rgba(255,255,255,0.32)',
        panelStrong: 'rgba(255,255,255,0.40)',
        border: 'rgba(255,255,255,0.50)',
        sceneText: 'rgba(255,255,255,0.96)',
        text: '#071120',
        muted: 'rgba(7,17,32,0.68)',
        faint: 'rgba(7,17,32,0.46)',
        accent: '#DDEEFF',
        glow: 'rgba(130,200,240,0.36)',
        cloud: 'rgba(200,230,255,0.36)',
        precipitation: 'rgba(200,230,255,0.80)',
        silhouette: 'rgba(5,14,40,0.72)',
        shadow: 'rgba(8,22,60,0.38)',
      };
    case 'night':
      return {
        skyTop: '#071024',
        skyMid: '#15224B',
        skyLow: '#1E293B',
        panel: 'rgba(21,34,75,0.42)',
        panelStrong: 'rgba(255,255,255,0.16)',
        border: 'rgba(255,255,255,0.34)',
        sceneText: '#F8FAFC',
        text: '#F8FAFC',
        muted: 'rgba(248,250,252,0.74)',
        faint: 'rgba(248,250,252,0.50)',
        accent: '#FFF7D6',
        glow: 'rgba(255,247,214,0.36)',
        cloud: 'rgba(226,232,240,0.28)',
        precipitation: 'rgba(248,250,252,0.84)',
        silhouette: 'rgba(4,11,26,0.56)',
        shadow: 'rgba(2,6,23,0.42)',
      };
    case 'rain':
    case 'heavy-rain':
    case 'storm':
      return {
        skyTop: kind === 'storm' ? '#111827' : '#1F3342',
        skyMid: kind === 'storm' ? '#27314F' : '#415A6B',
        skyLow: '#182532',
        panel: 'rgba(255,255,255,0.20)',
        panelStrong: 'rgba(255,255,255,0.24)',
        border: 'rgba(255,255,255,0.34)',
        sceneText: '#F8FAFC',
        text: '#F8FAFC',
        muted: 'rgba(248,250,252,0.76)',
        faint: 'rgba(248,250,252,0.54)',
        accent: kind === 'storm' ? '#C4B5FD' : '#DDEEFF',
        glow: kind === 'storm' ? 'rgba(196,181,253,0.32)' : 'rgba(221,238,255,0.24)',
        cloud: 'rgba(203,213,225,0.36)',
        precipitation: t.rain,
        silhouette: 'rgba(4,10,18,0.58)',
        shadow: 'rgba(2,6,23,0.38)',
      };
    case 'snow':
      return {
        skyTop: '#C9D6E8',
        skyMid: '#DFEAF5',
        skyLow: '#EFF5FB',
        panel: 'rgba(255,255,255,0.50)',
        panelStrong: 'rgba(255,255,255,0.58)',
        border: 'rgba(255,255,255,0.70)',
        sceneText: '#26324A',
        text: '#26324A',
        muted: 'rgba(38,50,74,0.72)',
        faint: 'rgba(38,50,74,0.52)',
        accent: '#FFFFFF',
        glow: 'rgba(255,255,255,0.56)',
        cloud: 'rgba(255,255,255,0.50)',
        precipitation: '#FFFFFF',
        silhouette: 'rgba(80,100,122,0.28)',
        shadow: 'rgba(38,50,74,0.24)',
      };
    case 'fog':
    case 'cloudy':
      return {
        skyTop: '#718093',
        skyMid: '#AAB7C8',
        skyLow: '#D8E0EA',
        panel: 'rgba(255,255,255,0.52)',
        panelStrong: 'rgba(255,255,255,0.62)',
        border: 'rgba(28,43,58,0.16)',
        sceneText: '#F8FAFC',          // top area sits on darker #718093 — keep white
        text: '#1E3448',               // dark slate for panel content — readable on light grey
        muted: 'rgba(30,52,72,0.72)',
        faint: 'rgba(30,52,72,0.50)',
        accent: '#4A6278',
        glow: 'rgba(255,255,255,0.30)',
        cloud: 'rgba(255,255,255,0.68)',
        precipitation: 'rgba(255,255,255,0.72)',
        silhouette: 'rgba(55,70,86,0.34)',
        shadow: 'rgba(15,23,42,0.26)',
      };
    case 'wind':
      return {
        skyTop: '#8EBEC4',
        skyMid: '#B8D9D6',
        skyLow: '#E2EAD8',
        panel: 'rgba(255,255,255,0.34)',
        panelStrong: 'rgba(255,255,255,0.44)',
        border: 'rgba(255,255,255,0.52)',
        sceneText: '#203E46',
        text: '#203E46',
        muted: 'rgba(32,62,70,0.70)',
        faint: 'rgba(32,62,70,0.52)',
        accent: '#5B8791',
        glow: 'rgba(255,255,255,0.32)',
        cloud: 'rgba(255,255,255,0.42)',
        precipitation: 'rgba(255,255,255,0.72)',
        silhouette: 'rgba(32,62,70,0.22)',
        shadow: 'rgba(32,62,70,0.24)',
      };
    case 'partly-cloudy':
    case 'sunny':
    default:
      return {
        skyTop: '#7DC2F5',
        skyMid: '#BDDDF1',
        skyLow: '#F4CB76',
        panel: 'rgba(255,255,255,0.52)',
        panelStrong: 'rgba(255,255,255,0.64)',
        border: 'rgba(12,52,100,0.18)',
        sceneText: '#0B2640',
        text: '#0B2640',
        muted: 'rgba(11,38,64,0.70)',
        faint: 'rgba(11,38,64,0.50)',
        accent: t.sun,
        glow: 'rgba(255,209,102,0.56)',
        cloud: 'rgba(255,255,255,0.62)',
        precipitation: 'rgba(255,255,255,0.68)',
        silhouette: 'rgba(85,68,34,0.22)',
        shadow: 'rgba(23,18,12,0.24)',
      };
  }
}

function precipProbability(weather: WeatherData): number {
  if (weather.daily?.[0]?.precipProb !== undefined) return weather.daily[0].precipProb;
  if (weather.hourly?.length) return Math.max(...weather.hourly.slice(0, 8).map(hour => hour.precipProb));
  return 0;
}

function formatVisibility(metres: number): string {
  if (metres >= 10000) return '10+ km';
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${metres} m`;
}

function formatPrecipRate(mmh: number): string {
  if (mmh === 0) return '0 mm/h';
  if (mmh < 0.1) return '<0.1 mm/h';
  return `${mmh.toFixed(1)} mm/h`;
}

function copyFor(kind: WeatherGlanceKind, weather: WeatherData): GlanceCopy {
  const precip = precipProbability(weather);
  const code = weather.conditionCode;

  switch (kind) {
    case 'hot': {
      const uvVal = weather.uvIndex !== undefined
        ? `${weather.uvIndex} · ${uvLabel(weather.uvIndex)}`
        : 'Very High';
      return {
        summary: weather.feelsLike >= 38
          ? 'Dangerous heat. Limit exposure, hydrate constantly.'
          : 'High heat. Loose fabrics, minimal layers.',
        verdict: weather.feelsLike >= 38 ? 'Linen or stay inside.' : 'Breathable fabrics only.',
        verdictIcon: 'thermometer-high',
        statOneLabel: 'UV Index',
        statOneValue: uvVal,
        statOneIcon: 'white-balance-sunny',
      };
    }
    case 'cold': {
      const windChill = weather.windChill !== undefined
        ? `${weather.windChill}°`
        : `${weather.feelsLike}°`;
      return {
        summary: weather.feelsLike <= -20
          ? 'Extreme cold. Exposed skin at risk within minutes.'
          : 'Sharp cold. Layers are load-bearing today.',
        verdict: weather.feelsLike <= -20 ? 'Full coverage. No compromises.' : 'Coat, gloves, thermal base.',
        verdictIcon: 'snowflake',
        statOneLabel: 'Wind Chill',
        statOneValue: windChill,
        statOneIcon: 'thermometer-low',
      };
    }
    case 'snow': {
      const isHeavy  = code === 75 || code === 86;
      const isGrains = code === 77;
      const rateStr  = weather.precipRate !== undefined ? formatPrecipRate(weather.precipRate) : `${precip}%`;
      return {
        summary: isHeavy  ? 'Heavy snowfall. Visibility dropping, roads compromised.'
                : isGrains ? 'Fine snow grains. Icy underfoot despite low accumulation.'
                :            'Snow accumulating. Watch the ground, not the sky.',
        verdict: isHeavy ? 'Maximum insulation. Waterproof everything.' : 'The coat is the outfit.',
        verdictIcon: 'hanger',
        statOneLabel: isHeavy ? 'Snowfall' : 'Precip',
        statOneValue: rateStr,
        statOneIcon: 'snowflake',
      };
    }
    case 'rain':
    case 'heavy-rain': {
      const isFreezing = code === 66 || code === 67;
      const isDrizzle  = code === 51 || code === 53 || code === 55 || code === 56 || code === 57;
      const isViolent  = code === 65 || code === 82 || code === 81;
      const rateStr    = weather.precipRate !== undefined ? formatPrecipRate(weather.precipRate) : `${precip}%`;
      const summary    = isFreezing ? 'Rain freezing on contact. Every surface is a liability.'
                       : isViolent  ? 'Heavy downpour. Move fast or get comprehensively wet.'
                       : isDrizzle  ? 'Fine drizzle. Quietly soaks everything given time.'
                       :              'Steady rain. Umbrella is non-negotiable.';
      const verdict    = isFreezing ? 'Waterproof and grip-forward footwear.'
                       : isViolent  ? 'Waterproof the whole look.'
                       :              'Waterproof the fantasy.';
      return {
        summary,
        verdict,
        verdictIcon: 'umbrella-outline',
        statOneLabel: 'Rate',
        statOneValue: rateStr,
        statOneIcon: 'water-outline',
      };
    }
    case 'storm': {
      const isHail = code === 96 || code === 99;
      return {
        summary: isHail
          ? 'Hail and lightning. Stay indoors until this passes.'
          : 'Active thunderstorm. Lightning present.',
        verdict: isHail ? 'Stay inside. Full stop.' : 'Shelter first, style later.',
        verdictIcon: 'weather-lightning',
        statOneLabel: 'Precip',
        statOneValue: `${precip}%`,
        statOneIcon: 'weather-lightning-rainy',
      };
    }
    case 'cloudy':
    case 'partly-cloudy': {
      const cloudPct = weather.cloudCoverPercent;
      const cloudStr = cloudPct !== undefined ? `${cloudPct}%` : weather.conditionLabel;
      const summary  = kind === 'cloudy'
        ? 'Grey sky sealed in. Muted light, flat shadows.'
        : 'Sun and cloud trading places. Layers are smart.';
      return {
        summary,
        verdict: 'Layer with intent.',
        verdictIcon: 'tshirt-crew-outline',
        statOneLabel: 'Cloud Cover',
        statOneValue: cloudStr,
        statOneIcon: 'weather-cloudy',
      };
    }
    case 'fog': {
      const isIcy = code === 48;
      const visStr = weather.visibility !== undefined
        ? formatVisibility(weather.visibility)
        : 'Very Low';
      return {
        summary: isIcy
          ? 'Icy fog. Ice crystal deposit forming on surfaces.'
          : 'Dense fog. Visibility down to metres.',
        verdict: 'Keep the lines clean. Visibility is a liability.',
        verdictIcon: 'blur',
        statOneLabel: 'Visibility',
        statOneValue: visStr,
        statOneIcon: 'weather-fog',
      };
    }
    case 'wind': {
      const gust = weather.windGust && weather.windGust > weather.windSpeed + 10
        ? ` · gusts ${weather.windGust}`
        : '';
      const isStrong = weather.windSpeed >= 50;
      return {
        summary: isStrong
          ? 'Strong wind. Loose items will not stay loose for long.'
          : 'Breezy enough to make volume a decision.',
        verdict: isStrong ? 'Anchor everything.' : 'Anchor the silhouette.',
        verdictIcon: 'weather-windy',
        statOneLabel: 'Wind',
        statOneValue: `${weather.windSpeed}${gust} km/h`,
        statOneIcon: 'weather-windy',
      };
    }
    case 'night': {
      const isLate = (() => {
        if (weather.utcOffsetSeconds === undefined) return false;
        const h = Math.floor((Date.now() / 1000 + weather.utcOffsetSeconds) / 3600) % 24;
        return h >= 22 || h < 4;
      })();
      return {
        summary: isLate
          ? 'Late night. Temperature at its lowest, dressing accordingly.'
          : 'Cooler air, sharper contrast.',
        verdict: isLate ? 'The jacket is the look.' : 'Bring the after-dark layer.',
        verdictIcon: 'moon-waning-crescent',
        statOneLabel: 'Humidity',
        statOneValue: `${weather.humidity}%`,
        statOneIcon: 'water-percent',
      };
    }
    case 'sunny':
    default: {
      const uvVal = weather.uvIndex !== undefined
        ? `${weather.uvIndex} · ${uvLabel(weather.uvIndex)}`
        : 'Moderate';
      const isWarm = weather.feelsLike >= 26;
      return {
        summary: isWarm
          ? 'Warm, dry, and fully committed to the look.'
          : 'Clear sky. Low wind. High visibility.',
        verdict: isWarm ? 'Take the sunglasses. Leave the layers.' : 'Take the sunglasses.',
        verdictIcon: 'sunglasses',
        statOneLabel: 'UV Index',
        statOneValue: uvVal,
        statOneIcon: 'white-balance-sunny',
      };
    }
  }
}

function editorialStatus(kind: WeatherGlanceKind): string {
  switch (kind) {
    case 'hot':         return 'HEAT ADVISORY';
    case 'cold':        return 'COLD SNAP';
    case 'rain':
    case 'heavy-rain':  return 'RAIN CHECK';
    case 'storm':       return 'STORM WATCH';
    case 'snow':        return 'SNOW MODE';
    case 'fog':         return 'LOW VISIBILITY';
    case 'wind':        return 'WIND CHECK';
    case 'night':       return 'AFTER DARK';
    case 'cloudy':
    case 'partly-cloudy': return 'LAYER CHECK';
    case 'sunny':
    default:            return 'SUN CHECK';
  }
}

function secondaryStatFor(primaryLabel: string, weather: WeatherData): GlanceStat {
  if (primaryLabel.toLowerCase() === 'wind') {
    return { label: 'Humidity', value: `${weather.humidity}%`, icon: 'water-percent' };
  }
  if (weather.feelsLike >= 33) {
    return { label: 'Humidity', value: `${weather.humidity}%`, icon: 'water-percent' };
  }
  if (weather.windChill !== undefined && weather.windChill <= -10) {
    return { label: 'Wind Chill', value: `${weather.windChill}°`, icon: 'thermometer-chevron-down' };
  }
  return { label: 'Wind', value: `${weather.windSpeed} km/h`, icon: 'weather-windy' };
}

function formatConsultedAt(weather: WeatherData, lastConsultedAt?: number | null): string {
  if (!lastConsultedAt) return 'CONSULTED';
  const time = formatLocationTimeWithCue(lastConsultedAt, weather.utcOffsetSeconds, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return time ? `LAST · ${time}` : 'CONSULTED';
}

export function WeatherGlanceCard({ weather, formatTemp, mode = 'strip', style, lastConsultedAt }: Props) {
  const { fonts, metrics, themeName } = useTheme();
  const { formatTemp: contextFormatTemp } = useTempUnit();
  const temp = formatTemp ?? contextFormatTemp;
  const kind = useMemo(() => weatherKind(weather), [weather]);
  const palette = useMemo(() => paletteFor(kind), [kind]);
  const copy = useMemo(() => copyFor(kind, weather), [kind, weather]);
  const secondaryStat = useMemo(() => secondaryStatFor(copy.statOneLabel, weather), [copy.statOneLabel, weather]);
  const cardRadius = metrics.radius;
  const isY2K = isY2KTheme(themeName);
  const styles = useMemo(() => makeStyles(fonts, palette, mode, cardRadius, isY2K), [fonts, palette, mode, cardRadius, isY2K]);
  const days = weather.daily?.slice(0, 3) ?? [];
  const useEditorialLayout = themeName === 'classic' || themeName === 'weather-editorial';
  const consultedLabel = useMemo(
    () => formatConsultedAt(weather, lastConsultedAt),
    [lastConsultedAt, weather],
  );

  if (!useEditorialLayout) {
    return (
      <AnimatedWeatherWidget
        weather={weather}
        temp={temp}
        kind={kind}
        palette={palette}
        fonts={fonts}
        mode={mode}
        cardRadius={cardRadius}
        isY2K={isY2K}
        style={style}
      />
    );
  }

  return (
    <View style={[styles.cardShell, style]}>
      <View style={styles.card}>
        {kind === 'sunny' ? (
          <SunnyWeatherAnimation borderRadius={cardRadius} utcOffsetSeconds={weather.utcOffsetSeconds} />
        ) : kind === 'hot' ? (
          <HotWeatherAnimation borderRadius={cardRadius} />
        ) : kind === 'cold' ? (
          <ColdWeatherAnimation borderRadius={cardRadius} />
        ) : (
          <>
            <Atmosphere kind={kind} palette={palette} mode={mode} />
            <WeatherDepthSubject kind={kind} palette={palette} mode={mode} />
          </>
        )}
        <View pointerEvents="none" style={styles.edgeHighlight} />
        <View pointerEvents="none" style={styles.depthShade} />

        <View style={styles.content}>
          <View style={styles.editorialHeader}>
            <Text style={styles.editorialKicker} numberOfLines={1}>WEATHER EDITORIAL</Text>
            <Text style={styles.editorialStatus} numberOfLines={1}>
              {kind === 'hot' ? 'HEAT ADVISORY' : kind === 'cold' ? 'COLD SNAP' : editorialStatus(kind)}
            </Text>
          </View>

          <View style={styles.glassPanel}>
            <View style={styles.panelSpecular} pointerEvents="none" />
            <View style={styles.locationRow}>
              <View style={styles.locationLeft}>
                <MaterialCommunityIcons name="map-marker-outline" size={15} color={palette.text} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {weather.city}{weather.country ? `, ${weather.country}` : ''}
                </Text>
              </View>
              <View style={styles.nowPill}>
                <Text style={styles.nowPillText} numberOfLines={1}>{consultedLabel}</Text>
              </View>
            </View>

            <View style={styles.temperatureGrid}>
              <View style={styles.temperatureRow}>
                <Text style={styles.temperature}>{temp(weather.temp)}</Text>
                <Text style={styles.degree}>°</Text>
              </View>
              <View style={styles.feelsBlock}>
                <Text style={styles.feelsLabel}>Feels like</Text>
                <Text style={styles.feelsValue}>{temp(weather.feelsLike)}°</Text>
              </View>
            </View>

            <View style={styles.conditionRow}>
              <MaterialCommunityIcons
                name={weather.conditionIcon as any}
                size={mode === 'hero' ? 28 : 24}
                color={['sunny', 'hot', 'cold', 'partly-cloudy'].includes(kind) ? palette.accent : palette.text}
              />
              <View style={styles.conditionCopy}>
                <Text style={styles.conditionLabel} numberOfLines={1}>{weather.conditionLabel}</Text>
                <Text style={styles.conditionSub} numberOfLines={2}>{copy.summary}</Text>
              </View>
            </View>

            <View style={styles.rule} />
            <Text style={styles.verdictLabel}>VERDICT</Text>
            <View style={styles.verdictRow}>
              <Text style={styles.verdict} numberOfLines={2}>{copy.verdict}</Text>
              <MaterialCommunityIcons name={copy.verdictIcon as any} size={22} color={palette.text} />
            </View>

            <View style={styles.statPill}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name={copy.statOneIcon as any} size={22} color={palette.text} />
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>{copy.statOneLabel}</Text>
                  <Text style={styles.statValue} numberOfLines={1}>{copy.statOneValue}</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name={secondaryStat.icon as any} size={22} color={palette.text} />
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>{secondaryStat.label}</Text>
                  <Text style={styles.statValue} numberOfLines={1}>{secondaryStat.value}</Text>
                </View>
              </View>
            </View>
          </View>

          {mode === 'hero' && days.length > 0 && (
            <View style={styles.dailyRail}>
              {days.map(day => (
                <View key={day.date} style={styles.dailyChip}>
                  <MaterialCommunityIcons name={day.conditionIcon as any} size={18} color={palette.text} />
                  <Text style={styles.dailyDay} numberOfLines={1}>{day.dayLabel}</Text>
                  <Text style={styles.dailyTemp}>{temp(day.tempMax)}°</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {kind !== 'sunny' && <WeatherForeground kind={kind} palette={palette} mode={mode} />}
      </View>
    </View>
  );
}

function AnimatedWeatherWidget({
  weather,
  temp,
  kind,
  palette,
  fonts,
  mode,
  cardRadius,
  isY2K,
  style,
}: {
  weather: WeatherData;
  temp: TempFormatter;
  kind: WeatherGlanceKind;
  palette: GlancePalette;
  fonts: AppFonts;
  mode: WeatherGlanceMode;
  cardRadius: AppMetrics['radius'];
  isY2K: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = makeWidgetStyles(fonts, palette, mode, cardRadius, isY2K);
  return (
    <View style={[styles.cardShell, style]}>
      <View style={styles.card}>
        {kind === 'sunny' ? (
          <SunnyWeatherAnimation borderRadius={cardRadius} utcOffsetSeconds={weather.utcOffsetSeconds} />
        ) : kind === 'hot' ? (
          <HotWeatherAnimation borderRadius={cardRadius} />
        ) : kind === 'cold' ? (
          <ColdWeatherAnimation borderRadius={cardRadius} />
        ) : (
          <>
            <Atmosphere kind={kind} palette={palette} mode={mode} />
            <WeatherDepthSubject kind={kind} palette={palette} mode={mode} />
          </>
        )}
        <View pointerEvents="none" style={styles.edgeHighlight} />
        <View pointerEvents="none" style={styles.depthShade} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.locationBlock}>
              <Text style={styles.kicker}>{weather.conditionLabel.toUpperCase()}</Text>
              <Text style={styles.city} numberOfLines={1}>{weather.city}</Text>
              <Text style={styles.country} numberOfLines={1}>{weather.country}</Text>
            </View>
            <View style={styles.iconBubble}>
              <MaterialCommunityIcons
                name={weather.conditionIcon as any}
                size={mode === 'hero' ? 30 : 26}
                color={palette.text}
              />
            </View>
          </View>

          <View style={styles.temperatureRow}>
            <Text style={styles.temperature}>{temp(weather.temp)}</Text>
            <Text style={styles.degree}>°</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>FEELS</Text>
              <Text style={styles.statValue}>{temp(weather.feelsLike)}°</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>HUMIDITY</Text>
              <Text style={styles.statValue}>{weather.humidity}%</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                {weather.windChill !== undefined && weather.windChill <= -10 ? 'CHILL' : 'WIND'}
              </Text>
              <Text style={styles.statValue}>
                {weather.windChill !== undefined && weather.windChill <= -10
                  ? weather.windChill
                  : weather.windSpeed}
              </Text>
              <Text style={styles.statUnit}>
                {weather.windChill !== undefined && weather.windChill <= -10 ? '°C' : 'km/h'}
              </Text>
            </View>
          </View>
        </View>
        {kind !== 'sunny' && <WeatherForeground kind={kind} palette={palette} mode={mode} />}
      </View>
    </View>
  );
}

function Atmosphere({ kind, palette, mode }: { kind: WeatherGlanceKind; palette: GlancePalette; mode: WeatherGlanceMode }) {
  const float = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const fall = useRef(new Animated.Value(0)).current;
  const fallAlt = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const driftSlow = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 22000, easing: Easing.linear, useNativeDriver: true }),
      ),
      Animated.loop(
        Animated.timing(fall, {
          toValue: 1,
          duration: kind === 'snow' ? 6200 : kind === 'heavy-rain' || kind === 'storm' ? 850 : 1250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.timing(fallAlt, {
          toValue: 1,
          duration: kind === 'snow' ? 8200 : kind === 'heavy-rain' || kind === 'storm' ? 1120 : 1620,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.timing(drift, {
          toValue: 1,
          duration: kind === 'wind' ? 2200 : 18000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.timing(driftSlow, {
          toValue: 1,
          duration: kind === 'wind' ? 3400 : 26000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.delay(2100),
          Animated.timing(flash, { toValue: 1, duration: 70, useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0, duration: 110, useNativeDriver: true }),
          Animated.delay(140),
          Animated.timing(flash, { toValue: 0.7, duration: 55, useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0, duration: 130, useNativeDriver: true }),
        ]),
      ),
    ];
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [drift, driftSlow, fall, fallAlt, flash, float, kind, pulse, spin]);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const moteY = float.interpolate({ inputRange: [0, 1], outputRange: [8, -12] });
  const cloudX = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-42, 42, -42] });
  const cloudXSlow = driftSlow.interpolate({ inputRange: [0, 0.5, 1], outputRange: [28, -28, 28] });
  const cloudXFar = driftSlow.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-78, 70, -78] });
  const mistOpacityOne = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.26] });
  const mistOpacityTwo = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.10] });
  const horizonOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.20, 0.42] });
  const shimmerOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.10, 0.22] });
  const shimmerX = driftSlow.interpolate({ inputRange: [0, 1], outputRange: [-260, 260] });
  const rainY = fall.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'hero' ? 680 : 520] });
  const rainYAlt = fallAlt.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'hero' ? 720 : 560] });
  const snowY = fall.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'hero' ? 660 : 500] });
  const snowYAlt = fallAlt.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'hero' ? 700 : 540] });
  const snowSway = float.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });
  const snowSwayReverse = float.interpolate({ inputRange: [0, 1], outputRange: [10, -10] });
  const windX = drift.interpolate({ inputRange: [0, 1], outputRange: [-260, 420] });
  const windLeafX = driftSlow.interpolate({ inputRange: [0, 1], outputRange: [-120, 250] });
  const spinRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinRotateReverse = spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.06] });
  const rippleScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.18] });
  const boltScale = flash.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.12] });
  const twinkle = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.38, 1, 0.58] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[stylesBase.skyTop, { backgroundColor: palette.skyTop }]} />
      <View style={[stylesBase.skyMid, { backgroundColor: palette.skyMid }]} />
      <View style={[stylesBase.skyLow, { backgroundColor: palette.skyLow }]} />
      <Animated.View style={[stylesBase.skySheen, { opacity: shimmerOpacity, transform: [{ translateX: shimmerX }, { rotate: '-18deg' }] }]} />
      <Animated.View style={[stylesBase.horizonGlow, { backgroundColor: palette.glow, opacity: horizonOpacity }]} />
      <Animated.View style={[stylesBase.glowOne, { backgroundColor: palette.glow, transform: [{ scale: pulseScale }] }]} />
      <View style={[stylesBase.glowTwo, { backgroundColor: palette.panelStrong }]} />
      <SceneSilhouette kind={kind} color={palette.silhouette} />

      {(kind === 'sunny' || kind === 'partly-cloudy') && (
        <Animated.View
          style={[
            stylesBase.sun,
            { transform: [{ translateY: floatY }, { scale: pulseScale }] },
          ]}
        >
          <View style={[stylesBase.sunCoronaOuter, { backgroundColor: palette.glow }]} />
          <View style={[stylesBase.sunCoronaMid, { backgroundColor: palette.glow }]} />
          <View style={[stylesBase.sunGlow, { backgroundColor: palette.glow }]} />
          <Animated.View style={[stylesBase.sunRayRing, { transform: [{ rotate: spinRotate }] }]}>
            {SUN_RAYS.map(angle => (
              <View key={`sun-ray-${angle}`} style={[stylesBase.sunRaySlot, { transform: [{ rotate: `${angle}deg` }] }]}>
                <View style={stylesBase.sunRay} />
              </View>
            ))}
          </Animated.View>
          <Animated.View style={[stylesBase.sunRayRingShort, { transform: [{ rotate: spinRotateReverse }] }]}>
            {SUN_RAYS.map(angle => (
              <View key={`sun-ray-short-${angle}`} style={[stylesBase.sunRaySlot, { transform: [{ rotate: `${angle + 22.5}deg` }] }]}>
                <View style={stylesBase.sunRayShort} />
              </View>
            ))}
          </Animated.View>
          <View style={[stylesBase.sunCore, { backgroundColor: palette.accent }]}>
            <View style={stylesBase.sunCoreHighlight} />
          </View>
        </Animated.View>
      )}

      {(kind === 'sunny' || kind === 'partly-cloudy' || kind === 'snow') && (
        <>
          {LIGHT_MOTES.map((mote, index) => (
            <Animated.View
              key={`mote-${index}`}
              style={[
                stylesBase.lightMote,
                {
                  left: `${mote.left}%`,
                  top: mote.top,
                  width: mote.size,
                  height: mote.size,
                  opacity: mote.opacity,
                  backgroundColor: kind === 'snow' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.70)',
                  transform: [{ translateY: index % 2 === 0 ? moteY : floatY }],
                },
              ]}
            />
          ))}
        </>
      )}

      {kind === 'night' && (
        <>
          <View style={stylesBase.nebula} />
          {STARS.map((star, index) => (
            <Animated.View
              key={`star-${index}`}
              style={[
                stylesBase.star,
                {
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: star.size,
                  height: star.size,
                  opacity: index % 3 === 0 ? twinkle : index % 3 === 1 ? 0.82 : 0.52,
                },
              ]}
            />
          ))}
          <Animated.View style={[stylesBase.shootingStar, { opacity: twinkle, transform: [{ translateX: shimmerX }, { rotate: '-20deg' }] }]}>
            <View style={stylesBase.shootingStarCore} />
          </Animated.View>
          <Animated.View style={[stylesBase.moon, { backgroundColor: palette.accent, transform: [{ translateY: floatY }] }]}>
            <View style={stylesBase.moonHaloOuter} />
            <View style={stylesBase.moonHalo} />
            <View style={stylesBase.moonCraterLarge} />
            <View style={stylesBase.moonCraterSmall} />
            <View style={[stylesBase.moonShadow, { backgroundColor: palette.skyTop }]} />
          </Animated.View>
        </>
      )}

      {(kind === 'sunny' || kind === 'cloudy' || kind === 'partly-cloudy' || kind === 'rain' || kind === 'heavy-rain' || kind === 'storm' || kind === 'snow' || kind === 'fog' || kind === 'wind') && (
        <>
          <Animated.View style={[stylesBase.cloudOne, { transform: [{ translateX: cloudX }, { translateY: floatY }] }]}>
            <CloudShape color={palette.cloud} />
          </Animated.View>
          <Animated.View style={[stylesBase.cloudTwo, { transform: [{ translateX: cloudXSlow }] }]}>
            <CloudShape color={palette.cloud} compact />
          </Animated.View>
          <Animated.View style={[stylesBase.cloudThree, { transform: [{ translateX: cloudXFar }, { translateY: moteY }] }]}>
            <CloudShape color={palette.cloud} compact soft />
          </Animated.View>
        </>
      )}

      {(kind === 'cloudy' || kind === 'fog' || kind === 'wind' || kind === 'rain' || kind === 'heavy-rain' || kind === 'storm') && (
        <>
          {WISPS.map((wisp, index) => (
            <Animated.View
              key={`wisp-${index}`}
              style={[
                stylesBase.wisp,
                {
                  top: wisp.top,
                  left: wisp.left,
                  width: wisp.width,
                  opacity: kind === 'fog' ? wisp.opacity + 0.16 : wisp.opacity,
                  backgroundColor: kind === 'storm' ? 'rgba(196,181,253,0.34)' : palette.precipitation,
                  transform: [{ translateX: index % 2 === 0 ? cloudXSlow : cloudXFar }],
                },
              ]}
            />
          ))}
        </>
      )}

      {(kind === 'rain' || kind === 'heavy-rain' || kind === 'storm') && (
        <View style={StyleSheet.absoluteFill}>
          {DISTANT_RAIN.map((drop, index) => (
            <Animated.View
              key={`rain-back-${index}`}
              style={[
                stylesBase.rainDrop,
                stylesBase.rainDropBack,
                {
                  left: `${drop.left}%`,
                  top: drop.top,
                  height: kind === 'heavy-rain' || kind === 'storm' ? drop.height + 28 : drop.height,
                  opacity: kind === 'heavy-rain' || kind === 'storm' ? drop.opacity + 0.14 : drop.opacity,
                  backgroundColor: palette.precipitation,
                  transform: [{ translateY: rainYAlt }, { rotate: '13deg' }],
                },
              ]}
            />
          ))}
          {RAIN_DROPS.map((drop, index) => (
            <Animated.View
              key={`rain-${index}`}
              style={[
                stylesBase.rainDrop,
                {
                  left: `${drop.left}%`,
                  top: drop.top,
                  height: kind === 'heavy-rain' || kind === 'storm' ? drop.height + 18 : drop.height,
                  opacity: kind === 'heavy-rain' || kind === 'storm' ? Math.min(drop.opacity + 0.18, 0.88) : drop.opacity,
                  backgroundColor: palette.precipitation,
                  transform: [{ translateY: rainY }, { rotate: '13deg' }],
                },
              ]}
            />
          ))}
          {RAIN_RIPPLES.map((ripple, index) => (
            <Animated.View
              key={`ripple-back-${index}`}
              style={[
                stylesBase.ripple,
                stylesBase.rippleBack,
                {
                  left: `${ripple.left + 5}%`,
                  bottom: ripple.bottom + 18,
                  width: ripple.width * 0.8,
                  borderColor: palette.precipitation,
                  opacity: kind === 'heavy-rain' || kind === 'storm' ? 0.20 : 0.12,
                  transform: [{ scaleX: pulseScale }],
                },
              ]}
            />
          ))}
          <View style={[stylesBase.rainHaze, { backgroundColor: palette.precipitation }]} />
          {RAIN_RIPPLES.map((ripple, index) => (
            <Animated.View
              key={`ripple-${index}`}
              style={[
                stylesBase.ripple,
                {
                  left: `${ripple.left}%`,
                  bottom: ripple.bottom,
                  width: ripple.width,
                  borderColor: palette.precipitation,
                  opacity: kind === 'heavy-rain' || kind === 'storm' ? 0.34 : 0.22,
                  transform: [{ scaleX: rippleScale }],
                },
              ]}
            />
          ))}
        </View>
      )}

      {kind === 'snow' && (
        <View style={StyleSheet.absoluteFill}>
          {SNOW_FLAKES.slice(0, 7).map((flake, index) => (
            <Animated.View
              key={`snow-back-${index}`}
              style={[
                stylesBase.snowFlake,
                stylesBase.snowFlakeBack,
                {
                  left: `${flake.left + 3}%`,
                  top: flake.top - 220,
                  width: Math.max(3, flake.size - 2),
                  height: Math.max(3, flake.size - 2),
                  opacity: flake.opacity * 0.46,
                  backgroundColor: palette.precipitation,
                  transform: [
                    { translateY: snowYAlt },
                    { translateX: index % 2 === 0 ? snowSwayReverse : snowSway },
                  ],
                },
              ]}
            />
          ))}
          {SNOW_FLAKES.map((flake, index) => (
            <Animated.View
              key={`snow-${index}`}
              style={[
                stylesBase.snowFlake,
                {
                  left: `${flake.left}%`,
                  top: flake.top,
                  width: flake.size,
                  height: flake.size,
                  opacity: flake.opacity,
                  backgroundColor: palette.precipitation,
                  transform: [
                    { translateY: snowY },
                    { translateX: index % 2 === 0 ? snowSway : snowSwayReverse },
                  ],
                },
              ]}
            />
          ))}
          {SNOW_SPARKLES.map((sparkle, index) => (
            <Animated.View
              key={`snow-sparkle-${index}`}
              style={[
                stylesBase.snowSparkle,
                {
                  left: `${sparkle.left}%`,
                  top: sparkle.top,
                  width: sparkle.size,
                  height: sparkle.size,
                  opacity: index % 2 === 0 ? twinkle : 0.52,
                  transform: [{ translateY: floatY }, { rotate: spinRotate }],
                },
              ]}
            />
          ))}
        </View>
      )}

      {(kind === 'fog' || kind === 'cloudy') && (
        <>
          <Animated.View style={[stylesBase.mist, stylesBase.mistOne, { backgroundColor: palette.precipitation, opacity: mistOpacityOne, transform: [{ translateX: cloudX }] }]} />
          <Animated.View style={[stylesBase.mist, stylesBase.mistTwo, { backgroundColor: palette.precipitation, opacity: mistOpacityTwo, transform: [{ translateX: cloudXSlow }] }]} />
          <Animated.View style={[stylesBase.mist, stylesBase.mistThree, { backgroundColor: palette.precipitation, opacity: mistOpacityOne, transform: [{ translateX: cloudXSlow }] }]} />
          <Animated.View style={[stylesBase.mist, stylesBase.mistFour, { backgroundColor: palette.precipitation, opacity: mistOpacityTwo, transform: [{ translateX: cloudX }] }]} />
          <Animated.View style={[stylesBase.fogLine, stylesBase.fogLineOne, { backgroundColor: palette.precipitation, opacity: mistOpacityOne, transform: [{ translateX: cloudXFar }] }]} />
          <Animated.View style={[stylesBase.fogLine, stylesBase.fogLineTwo, { backgroundColor: palette.precipitation, opacity: mistOpacityTwo, transform: [{ translateX: cloudX }] }]} />
        </>
      )}

      {kind === 'wind' && (
        <View style={StyleSheet.absoluteFill}>
          {WIND_STREAKS.map((streak, index) => (
            <Animated.View
              key={`wind-${index}`}
              style={[
                stylesBase.windStreak,
                {
                  top: streak.top,
                  width: streak.width,
                  opacity: streak.opacity,
                  backgroundColor: palette.precipitation,
                  transform: [{ translateX: windX }],
                },
              ]}
            >
              <View style={[stylesBase.windStreakCap, { backgroundColor: palette.precipitation }]} />
            </Animated.View>
          ))}
          {WIND_LEAVES.map((leaf, index) => (
            <Animated.View
              key={`wind-leaf-${index}`}
              style={[
                stylesBase.windLeaf,
                {
                  top: leaf.top,
                  left: leaf.left,
                  width: leaf.size,
                  height: leaf.size * 1.9,
                  backgroundColor: palette.accent,
                  opacity: 0.42,
                  transform: [{ translateX: windLeafX }, { rotate: leaf.rotate }],
                },
              ]}
            />
          ))}
        </View>
      )}

      {kind === 'storm' && (
        <>
          <Animated.View style={[stylesBase.flash, { opacity: flash }]} />
          <Animated.View style={[stylesBase.stormStreakHigh, { opacity: flash }]} />
          <Animated.View style={[stylesBase.stormStreakLow, { opacity: flash }]} />
          <Animated.View style={[stylesBase.electricRing, { opacity: flash, transform: [{ scale: boltScale }] }]} />
          <Animated.View style={[stylesBase.stormBolt, { opacity: flash, transform: [{ scale: boltScale }] }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={86} color="#FDE68A" />
          </Animated.View>
        </>
      )}
    </View>
  );
}

function WeatherDepthSubject({ kind, palette, mode }: { kind: WeatherGlanceKind; palette: GlancePalette; mode: WeatherGlanceMode }) {
  const float = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: kind === 'wind' ? 5200 : 18000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
    ];
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [float, kind, pulse, spin]);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const subjectScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.05] });
  const shadowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1.08, 0.88] });
  const spinRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinReverse = spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const windSlide = spin.interpolate({ inputRange: [0, 1], outputRange: [-130, 170] });
  const anchorTop = mode === 'hero' ? 76 : 46;
  const anchorRight = mode === 'hero' ? 30 : 14;

  return (
    <View pointerEvents="none" style={stylesBase.depthSubjectLayer}>
      <Animated.View
        style={[
          stylesBase.subjectCastShadow,
          {
            top: anchorTop + 116,
            right: anchorRight + 12,
            backgroundColor: palette.shadow,
            transform: [{ scaleX: shadowScale }, { rotate: '-7deg' }],
          },
        ]}
      />
      <Animated.View
        style={[
          stylesBase.depthSubject,
          {
            top: anchorTop,
            right: anchorRight,
            transform: [{ translateY: floatY }, { scale: subjectScale }],
          },
        ]}
      >
        {(kind === 'sunny' || kind === 'partly-cloudy') && (
          <>
            <Animated.View style={[stylesBase.subjectRayRing, { transform: [{ rotate: spinRotate }] }]}>
              {SUN_RAYS.map(angle => (
                <View key={`subject-ray-${angle}`} style={[stylesBase.subjectRaySlot, { transform: [{ rotate: `${angle}deg` }] }]}>
                  <View style={stylesBase.subjectRay} />
                </View>
              ))}
            </Animated.View>
            <Animated.View style={[stylesBase.subjectRayRingSoft, { transform: [{ rotate: spinReverse }] }]}>
              {SUN_RAYS.map(angle => (
                <View key={`subject-soft-ray-${angle}`} style={[stylesBase.subjectRaySlot, { transform: [{ rotate: `${angle + 22.5}deg` }] }]}>
                  <View style={stylesBase.subjectRaySoft} />
                </View>
              ))}
            </Animated.View>
            <View style={[stylesBase.subjectSun, { backgroundColor: palette.accent }]}>
              <View style={stylesBase.subjectSunShade} />
              <View style={stylesBase.subjectSunInnerGlow} />
              <View style={stylesBase.subjectSunHighlight} />
              <View style={stylesBase.subjectSunSpecular} />
            </View>
            {kind === 'partly-cloudy' && (
              <View style={stylesBase.subjectCloudFront}>
                <CloudShape color="rgba(255,255,255,0.82)" compact />
              </View>
            )}
          </>
        )}

        {kind === 'night' && (
          <View style={[stylesBase.subjectMoon, { backgroundColor: palette.accent }]}>
            <View style={stylesBase.subjectMoonShade} />
            <View style={stylesBase.subjectMoonCraterOne} />
            <View style={stylesBase.subjectMoonCraterTwo} />
            <View style={stylesBase.subjectMoonGlow} />
          </View>
        )}

        {(kind === 'cloudy' || kind === 'fog' || kind === 'wind') && (
          <>
            <View style={stylesBase.subjectCloudBack}>
              <CloudShape color={palette.cloud} compact soft />
            </View>
            <View style={stylesBase.subjectCloudMain}>
              <CloudShape color="rgba(255,255,255,0.78)" />
            </View>
            {kind === 'wind' && (
              <>
                <Animated.View style={[stylesBase.subjectWindRibbon, { backgroundColor: palette.precipitation, transform: [{ translateX: windSlide }] }]} />
                <Animated.View style={[stylesBase.subjectWindRibbon, stylesBase.subjectWindRibbonLower, { backgroundColor: palette.precipitation, transform: [{ translateX: windSlide }] }]} />
              </>
            )}
          </>
        )}

        {(kind === 'rain' || kind === 'heavy-rain' || kind === 'storm') && (
          <>
            <View style={stylesBase.subjectCloudBack}>
              <CloudShape color={palette.cloud} compact soft />
            </View>
            <View style={stylesBase.subjectCloudMain}>
              <CloudShape color={palette.cloud} />
            </View>
            <View style={[stylesBase.subjectDrop, stylesBase.subjectDropLarge, { backgroundColor: palette.precipitation }]} />
            <View style={[stylesBase.subjectDrop, stylesBase.subjectDropSmall, { backgroundColor: palette.precipitation }]} />
            {kind === 'storm' && (
              <View style={stylesBase.subjectLightning}>
                <MaterialCommunityIcons name="lightning-bolt" size={54} color="#FDE68A" />
              </View>
            )}
          </>
        )}

        {kind === 'snow' && (
          <>
            <Animated.View style={[stylesBase.subjectSnowRing, { transform: [{ rotate: spinRotate }] }]}>
              <View style={stylesBase.subjectSnowArmVertical} />
              <View style={stylesBase.subjectSnowArmHorizontal} />
              <View style={stylesBase.subjectSnowArmDiagOne} />
              <View style={stylesBase.subjectSnowArmDiagTwo} />
            </Animated.View>
            <View style={[stylesBase.subjectSnowCore, { backgroundColor: palette.precipitation }]} />
          </>
        )}
      </Animated.View>
    </View>
  );
}

function WeatherForeground({ kind, palette, mode }: { kind: WeatherGlanceKind; palette: GlancePalette; mode: WeatherGlanceMode }) {
  const fall = useRef(new Animated.Value(0)).current;
  const fallAlt = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fall.setValue(0);
    fallAlt.setValue(0);
    drift.setValue(0);
    pulse.setValue(0);
    flash.setValue(0);

    const isHardRain = kind === 'heavy-rain' || kind === 'storm';
    const loops = [
      Animated.loop(
        Animated.timing(fall, {
          toValue: 1,
          duration: kind === 'snow' ? 7600 : isHardRain ? 920 : 1380,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.timing(fallAlt, {
          toValue: 1,
          duration: kind === 'snow' ? 9400 : isHardRain ? 1240 : 1720,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.timing(drift, {
          toValue: 1,
          duration: kind === 'wind' ? 1700 : 8600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
    ];

    if (kind === 'storm') {
      loops.push(
        Animated.loop(
          Animated.sequence([
            Animated.delay(2600),
            Animated.timing(flash, { toValue: 1, duration: 70, useNativeDriver: true }),
            Animated.timing(flash, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.delay(180),
            Animated.timing(flash, { toValue: 0.62, duration: 55, useNativeDriver: true }),
            Animated.timing(flash, { toValue: 0, duration: 160, useNativeDriver: true }),
          ]),
        ),
      );
    }

    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [drift, fall, fallAlt, flash, kind, pulse]);

  const travel = mode === 'hero' ? 760 : 560;
  const rainY = fall.interpolate({ inputRange: [0, 1], outputRange: [0, travel] });
  const rainYAlt = fallAlt.interpolate({ inputRange: [0, 1], outputRange: [0, travel + 110] });
  const snowY = fall.interpolate({ inputRange: [0, 1], outputRange: [0, travel - 40] });
  const snowYAlt = fallAlt.interpolate({ inputRange: [0, 1], outputRange: [0, travel + 20] });
  const shimmerX = drift.interpolate({ inputRange: [0, 1], outputRange: [-260, 260] });
  const veilX = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-72, 72, -72] });
  const windX = drift.interpolate({ inputRange: [0, 1], outputRange: [-260, 430] });
  const snowSway = pulse.interpolate({ inputRange: [0, 1], outputRange: [-14, 18] });
  const snowSwayAlt = pulse.interpolate({ inputRange: [0, 1], outputRange: [16, -12] });
  const beamOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.10, 0.22] });
  const glintOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.26, 0.72, 0.34] });
  const glintScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.34] });
  const flashOpacity = flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.26] });
  const isHardRain = kind === 'heavy-rain' || kind === 'storm';

  return (
    <View pointerEvents="none" style={stylesBase.foreground}>
      {(kind === 'sunny' || kind === 'partly-cloudy') && (
        <>
          <Animated.View
            style={[
              stylesBase.foregroundBeam,
              {
                backgroundColor: 'rgba(255,255,255,0.64)',
                opacity: beamOpacity,
                transform: [{ translateX: shimmerX }, { rotate: '-17deg' }],
              },
            ]}
          />
          <Animated.View
            style={[
              stylesBase.foregroundBeamAlt,
              {
                backgroundColor: palette.glow,
                opacity: beamOpacity,
                transform: [{ translateX: veilX }, { rotate: '15deg' }],
              },
            ]}
          />
          {FOREGROUND_GLINTS.map((glint, index) => (
            <Animated.View
              key={`foreground-glint-${index}`}
              style={[
                stylesBase.foregroundGlint,
                {
                  left: `${glint.left}%`,
                  top: mode === 'hero' ? glint.top + 46 : glint.top,
                  width: glint.size,
                  height: glint.size,
                  opacity: glintOpacity,
                  transform: [{ scale: glintScale }, { rotate: '45deg' }],
                },
              ]}
            />
          ))}
        </>
      )}

      {(kind === 'rain' || kind === 'heavy-rain' || kind === 'storm') && (
        <>
          <Animated.View
            style={[
              stylesBase.wetSheen,
              {
                backgroundColor: palette.precipitation,
                opacity: isHardRain ? 0.13 : 0.08,
                transform: [{ translateX: shimmerX }, { rotate: '-14deg' }],
              },
            ]}
          />
          {FOREGROUND_RAIN.map((drop, index) => (
            <Animated.View
              key={`foreground-rain-${index}`}
              style={[
                stylesBase.foregroundRainDrop,
                {
                  left: `${drop.left}%`,
                  top: drop.top,
                  height: isHardRain ? drop.height + 48 : drop.height,
                  opacity: isHardRain ? Math.min(drop.opacity + 0.10, 0.32) : drop.opacity,
                  backgroundColor: palette.precipitation,
                  transform: [
                    { translateY: index % 2 === 0 ? rainY : rainYAlt },
                    { rotate: '13deg' },
                  ],
                },
              ]}
            />
          ))}
        </>
      )}

      {kind === 'snow' && (
        <>
          <Animated.View style={[stylesBase.foregroundSnowGlow, { backgroundColor: palette.glow, opacity: beamOpacity }]} />
          {FOREGROUND_SNOW.map((flake, index) => (
            <Animated.View
              key={`foreground-snow-${index}`}
              style={[
                stylesBase.foregroundSnowFlake,
                {
                  left: `${flake.left}%`,
                  top: flake.top,
                  width: flake.size,
                  height: flake.size,
                  opacity: flake.opacity,
                  backgroundColor: palette.precipitation,
                  transform: [
                    { translateY: index % 2 === 0 ? snowY : snowYAlt },
                    { translateX: index % 2 === 0 ? snowSway : snowSwayAlt },
                  ],
                },
              ]}
            />
          ))}
        </>
      )}

      {(kind === 'fog' || kind === 'cloudy') && (
        <>
          <Animated.View
            style={[
              stylesBase.foregroundVeil,
              {
                backgroundColor: palette.precipitation,
                opacity: kind === 'fog' ? 0.24 : 0.14,
                transform: [{ translateX: veilX }],
              },
            ]}
          />
          <Animated.View
            style={[
              stylesBase.foregroundVeil,
              stylesBase.foregroundVeilAlt,
              {
                backgroundColor: palette.precipitation,
                opacity: kind === 'fog' ? 0.18 : 0.10,
                transform: [{ translateX: shimmerX }],
              },
            ]}
          />
        </>
      )}

      {kind === 'wind' && (
        <>
          {FOREGROUND_WIND.map((streak, index) => (
            <Animated.View
              key={`foreground-wind-${index}`}
              style={[
                stylesBase.foregroundWind,
                {
                  top: streak.top,
                  width: streak.width,
                  opacity: streak.opacity,
                  backgroundColor: palette.precipitation,
                  transform: [{ translateX: windX }],
                },
              ]}
            >
              <View style={[stylesBase.foregroundWindCap, { backgroundColor: palette.precipitation }]} />
            </Animated.View>
          ))}
        </>
      )}

      {kind === 'night' && (
        <>
          <Animated.View
            style={[
              stylesBase.foregroundNightSheen,
              {
                opacity: beamOpacity,
                transform: [{ translateX: shimmerX }, { rotate: '-20deg' }],
              },
            ]}
          />
          {FOREGROUND_GLINTS.map((glint, index) => (
            <Animated.View
              key={`foreground-star-${index}`}
              style={[
                stylesBase.foregroundGlint,
                stylesBase.foregroundStar,
                {
                  left: `${glint.left + 4}%`,
                  top: mode === 'hero' ? glint.top + 34 : glint.top - 28,
                  width: glint.size,
                  height: glint.size,
                  opacity: index % 2 === 0 ? glintOpacity : 0.34,
                  transform: [{ scale: glintScale }, { rotate: '45deg' }],
                },
              ]}
            />
          ))}
        </>
      )}

      {kind === 'storm' && <Animated.View style={[stylesBase.foregroundFlash, { opacity: flashOpacity }]} />}
    </View>
  );
}

function CloudShape({ color, compact = false, soft = false }: { color: string; compact?: boolean; soft?: boolean }) {
  return (
    <View style={[stylesBase.cloud, compact && stylesBase.cloudCompact, soft && stylesBase.cloudSoft, { backgroundColor: color }]}>
      <View style={[stylesBase.cloudShade, compact && stylesBase.cloudShadeCompact]} />
      <View style={[stylesBase.cloudLobeLeft, { backgroundColor: color }]} />
      <View style={[stylesBase.cloudLobeRight, compact && stylesBase.cloudLobeRightCompact, { backgroundColor: color }]} />
      <View style={[stylesBase.cloudHighlight, compact && stylesBase.cloudHighlightCompact]} />
    </View>
  );
}

function SceneSilhouette({ kind, color }: { kind: WeatherGlanceKind; color: string }) {
  if (kind === 'rain' || kind === 'heavy-rain' || kind === 'storm' || kind === 'night') {
    return (
      <View style={stylesBase.cityLine}>
        {[18, 34, 24, 42, 28, 48, 32].map((height, index) => (
          <View key={`tower-${index}`} style={[stylesBase.tower, { height, backgroundColor: color }]} />
        ))}
      </View>
    );
  }

  if (kind === 'snow') {
    return (
      <View style={stylesBase.forestLine}>
        {[46, 70, 52, 82, 58, 76, 48].map((height, index) => (
          <View
            key={`pine-${index}`}
            style={[
              stylesBase.pine,
              {
                borderBottomWidth: height,
                borderBottomColor: color,
                marginLeft: index === 0 ? 0 : -10,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <>
      <View style={[stylesBase.hillFar, { backgroundColor: color }]} />
      <View style={[stylesBase.hill, { backgroundColor: color }]} />
    </>
  );
}

function makeWidgetStyles(fonts: AppFonts, palette: GlancePalette, mode: WeatherGlanceMode, cardRadius: AppMetrics['radius'], isY2K: boolean) {
  const isHero = mode === 'hero';
  return StyleSheet.create({
    cardShell: {
      position: 'relative',
      minHeight: isHero ? 364 : 318,
      borderRadius: cardRadius,
      marginBottom: isHero ? 0 : spacing.lg,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: isHero ? 34 : 28 },
      shadowOpacity: 0.42,
      shadowRadius: isHero ? 46 : 38,
      elevation: 12,
      transform: [
        { perspective: 900 },
        { rotateX: isHero ? '2deg' : '1deg' },
        { rotateY: isHero ? '-2.5deg' : '-1.25deg' },
      ],
    },
    card: {
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
      minHeight: isHero ? 364 : 318,
      borderRadius: cardRadius,
      backgroundColor: palette.skyTop,
      padding: isHero ? spacing.lg : spacing.md,
      borderWidth: 1,
      borderColor: palette.border,
    },
    edgeHighlight: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: cardRadius,
      borderTopWidth: 2,
      borderLeftWidth: 1,
      borderColor: 'rgba(255,255,255,0.48)',
      zIndex: 1,
    },
    depthShade: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '42%',
      backgroundColor: 'rgba(0,0,0,0.07)',
      zIndex: 1,
    },
    content: {
      position: 'relative',
      zIndex: 2,
      flex: 1,
      justifyContent: 'space-between',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    locationBlock: {
      flex: 1,
    },
    kicker: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 2,
      color: palette.muted,
      marginBottom: 6,
    },
    city: {
      fontFamily: fonts.displayBold,
      fontSize: isHero ? 30 : 24,
      lineHeight: isY2K ? (isHero ? 42 : 34) : (isHero ? 34 : 28),
      color: palette.text,
      letterSpacing: 0,
    },
    country: {
      fontFamily: fonts.mono,
      fontSize: 12,
      letterSpacing: 1,
      color: palette.faint,
      marginTop: 3,
    },
    iconBubble: {
      width: isHero ? 52 : 46,
      height: isHero ? 52 : 46,
      borderRadius: cardRadius,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.panel,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 4,
    },
    temperatureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: isHero ? 46 : 36,
      marginBottom: isHero ? spacing.lg : spacing.md,
    },
    temperature: {
      fontFamily: fonts.displayBold,
      fontSize: isHero ? 108 : 88,
      lineHeight: isY2K ? (isHero ? 132 : 108) : (isHero ? 112 : 92),
      color: palette.text,
      letterSpacing: 0,
    },
    degree: {
      fontFamily: fonts.displayBold,
      fontSize: isHero ? 44 : 36,
      lineHeight: isY2K ? (isHero ? 60 : 50) : (isHero ? 52 : 44),
      color: palette.muted,
      marginTop: 8,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.panelStrong,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.18,
      shadowRadius: 22,
      elevation: 5,
    },
    stat: {
      flex: 1,
      minHeight: 72,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: 6,
    },
    statDivider: {
      width: 1,
      backgroundColor: palette.border,
    },
    statLabel: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 1.3,
      color: palette.faint,
      marginBottom: 4,
    },
    statValue: {
      fontFamily: fonts.displayBold,
      fontSize: isHero ? 22 : 19,
      lineHeight: isY2K ? (isHero ? 32 : 28) : (isHero ? 26 : 23),
      color: palette.text,
      letterSpacing: 0,
    },
    statUnit: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: palette.faint,
      marginTop: 1,
    },
  });
}

function makeStyles(fonts: AppFonts, palette: GlancePalette, mode: WeatherGlanceMode, cardRadius: AppMetrics['radius'], isY2K: boolean) {
  const isHero = mode === 'hero';
  return StyleSheet.create({
    cardShell: {
      position: 'relative',
      minHeight: isHero ? 590 : 430,
      borderRadius: cardRadius,
      marginBottom: isHero ? 0 : spacing.lg,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: isHero ? 42 : 30 },
      shadowOpacity: 0.46,
      shadowRadius: isHero ? 56 : 42,
      elevation: 14,
      transform: [
        { perspective: 1000 },
        { rotateX: isHero ? '2.5deg' : '1.5deg' },
        { rotateY: isHero ? '-3deg' : '-1.5deg' },
      ],
    },
    card: {
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
      minHeight: isHero ? 590 : 430,
      borderRadius: cardRadius,
      backgroundColor: palette.skyTop,
      paddingHorizontal: isHero ? spacing.lg : spacing.md,
      paddingTop: isHero ? spacing.md : spacing.sm,
      paddingBottom: isHero ? spacing.lg : spacing.md,
      borderWidth: 1,
      borderColor: palette.border,
    },
    edgeHighlight: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: cardRadius,
      borderTopWidth: 2,
      borderLeftWidth: 1,
      borderColor: 'rgba(255,255,255,0.52)',
      zIndex: 1,
    },
    depthShade: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '44%',
      backgroundColor: 'rgba(0,0,0,0.08)',
      zIndex: 1,
    },
    content: {
      position: 'relative',
      zIndex: 2,
      flex: 1,
      justifyContent: 'space-between',
    },
    editorialHeader: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: isHero ? 92 : 36,
    },
    editorialKicker: {
      flex: 1,
      fontFamily: fonts.monoMedium,
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 1.6,
      color: palette.sceneText,
      textShadowColor: 'rgba(0,0,0,0.12)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 12,
    },
    editorialStatus: {
      flexShrink: 0,
      maxWidth: '58%',
      fontFamily: fonts.monoMedium,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 1.2,
      color: palette.sceneText,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.panel,
      overflow: 'hidden',
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 3,
    },
    glassPanel: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: cardRadius,
      padding: isHero ? spacing.md : 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.panel,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: isHero ? 30 : 22 },
      shadowOpacity: 0.34,
      shadowRadius: isHero ? 42 : 32,
      elevation: 10,
      transform: [{ translateY: isHero ? -2 : 0 }],
    },
    panelSpecular: {
      position: 'absolute',
      top: 0,
      left: '12%',
      right: '12%',
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.74)',
      opacity: 0.72,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: isHero ? spacing.sm : 6,
    },
    locationLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      flex: 1,
      fontFamily: fonts.monoMedium,
      fontSize: 12,
      color: palette.text,
      letterSpacing: 0,
    },
    nowPill: {
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.panelStrong,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    nowPillText: {
      fontFamily: fonts.monoMedium,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1,
      color: palette.text,
    },
    temperatureGrid: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    temperatureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexShrink: 1,
    },
    temperature: {
      fontFamily: fonts.displayLight,
      fontSize: isHero ? 92 : 76,
      lineHeight: isY2K ? (isHero ? 112 : 92) : (isHero ? 96 : 80),
      color: palette.text,
      letterSpacing: 0,
    },
    degree: {
      fontFamily: fonts.displayLight,
      fontSize: isHero ? 36 : 30,
      lineHeight: isY2K ? (isHero ? 50 : 42) : (isHero ? 44 : 38),
      color: palette.text,
      marginTop: 8,
    },
    feelsBlock: {
      minWidth: 78,
      paddingTop: isHero ? 31 : 25,
      alignItems: 'flex-start',
    },
    feelsLabel: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: palette.faint,
      marginBottom: 3,
    },
    feelsValue: {
      fontFamily: fonts.display,
      fontSize: isHero ? 26 : 22,
      lineHeight: isY2K ? (isHero ? 34 : 30) : (isHero ? 30 : 26),
      color: palette.text,
    },
    conditionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: isHero ? spacing.sm : 6,
    },
    conditionCopy: {
      flex: 1,
    },
    conditionLabel: {
      fontFamily: fonts.displayBold,
      fontSize: isHero ? 18 : 16,
      color: palette.text,
      lineHeight: isY2K ? (isHero ? 27 : 24) : (isHero ? 22 : 20),
    },
    conditionSub: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: palette.muted,
      marginTop: 2,
    },
    rule: {
      height: 1,
      backgroundColor: palette.border,
      marginVertical: isHero ? spacing.md : spacing.sm,
    },
    verdictLabel: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 1.8,
      color: palette.faint,
      marginBottom: 3,
    },
    verdictRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: isHero ? spacing.md : spacing.sm,
    },
    verdict: {
      flex: 1,
      fontFamily: fonts.display,
      fontSize: isHero ? 24 : 21,
      lineHeight: isY2K ? (isHero ? 34 : 30) : (isHero ? 28 : 25),
      color: palette.text,
    },
    statPill: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: cardRadius,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.panelStrong,
      overflow: 'hidden',
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 22,
      elevation: 4,
    },
    statItem: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    statText: {
      flex: 1,
      minWidth: 0,
    },
    statDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: palette.border,
    },
    statLabel: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: palette.faint,
      marginBottom: 2,
    },
    statValue: {
      fontFamily: fonts.monoMedium,
      fontSize: 12,
      color: palette.text,
      letterSpacing: 0,
    },
    dailyRail: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
    },
    dailyChip: {
      flex: 1,
      minHeight: 72,
      borderRadius: cardRadius,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.panel,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 4,
    },
    dailyDay: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: palette.muted,
    },
    dailyTemp: {
      fontFamily: fonts.displayBold,
      fontSize: 16,
      lineHeight: isY2K ? 24 : 20,
      color: palette.text,
    },
  });
}

const stylesBase = StyleSheet.create({
  depthSubjectLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  depthSubject: {
    position: 'absolute',
    width: 184,
    height: 172,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectCastShadow: {
    position: 'absolute',
    width: 128,
    height: 30,
    borderRadius: 999,
    opacity: 0.20,
    transform: [{ rotate: '-7deg' }],
  },
  subjectRayRing: {
    position: 'absolute',
    width: 152,
    height: 152,
    borderRadius: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectRayRingSoft: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.46,
  },
  subjectRaySlot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  subjectRay: {
    width: 5,
    height: 31,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#FFF2A8',
    shadowOpacity: 0.78,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  subjectRaySoft: {
    width: 3,
    height: 23,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  subjectSun: {
    width: 86,
    height: 86,
    borderRadius: 43,
    overflow: 'hidden',
    shadowColor: '#FFD166',
    shadowOpacity: 0.90,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  subjectSunShade: {
    position: 'absolute',
    right: -10,
    bottom: -12,
    width: 78,
    height: 60,
    borderRadius: 999,
    backgroundColor: 'rgba(184,94,36,0.24)',
  },
  subjectSunInnerGlow: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  subjectSunHighlight: {
    position: 'absolute',
    top: 14,
    left: 18,
    width: 26,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  subjectSunSpecular: {
    position: 'absolute',
    top: 39,
    left: 17,
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.44)',
  },
  subjectCloudFront: {
    position: 'absolute',
    left: -10,
    bottom: 24,
    opacity: 0.92,
    transform: [{ scale: 0.62 }],
  },
  subjectMoon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: 'hidden',
    shadowColor: '#FFF7D6',
    shadowOpacity: 0.78,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  subjectMoonShade: {
    position: 'absolute',
    right: -18,
    top: -4,
    width: 70,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(15,23,42,0.28)',
  },
  subjectMoonCraterOne: {
    position: 'absolute',
    left: 21,
    top: 20,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: 'rgba(148,163,184,0.22)',
  },
  subjectMoonCraterTwo: {
    position: 'absolute',
    left: 43,
    top: 45,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148,163,184,0.18)',
  },
  subjectMoonGlow: {
    position: 'absolute',
    left: 9,
    top: 9,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  subjectCloudBack: {
    position: 'absolute',
    top: 30,
    right: -22,
    opacity: 0.50,
    transform: [{ scale: 0.58 }],
  },
  subjectCloudMain: {
    position: 'absolute',
    top: 48,
    right: -6,
    opacity: 0.90,
    transform: [{ scale: 0.72 }],
  },
  subjectWindRibbon: {
    position: 'absolute',
    left: -130,
    top: 74,
    width: 132,
    height: 3,
    borderRadius: 999,
    opacity: 0.42,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  subjectWindRibbonLower: {
    top: 118,
    width: 168,
    opacity: 0.28,
  },
  subjectDrop: {
    position: 'absolute',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 999,
    shadowColor: '#DDEEFF',
    shadowOpacity: 0.52,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    transform: [{ rotate: '21deg' }],
  },
  subjectDropLarge: {
    left: 48,
    top: 92,
    width: 25,
    height: 42,
    opacity: 0.72,
  },
  subjectDropSmall: {
    right: 48,
    top: 108,
    width: 16,
    height: 28,
    opacity: 0.48,
  },
  subjectLightning: {
    position: 'absolute',
    top: 80,
    left: 70,
    shadowColor: '#FDE68A',
    shadowOpacity: 0.84,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  subjectSnowRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.60,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  subjectSnowArmVertical: {
    position: 'absolute',
    width: 4,
    height: 92,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.76)',
  },
  subjectSnowArmHorizontal: {
    position: 'absolute',
    width: 92,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.76)',
  },
  subjectSnowArmDiagOne: {
    position: 'absolute',
    width: 82,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.58)',
    transform: [{ rotate: '45deg' }],
  },
  subjectSnowArmDiagTwo: {
    position: 'absolute',
    width: 82,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.58)',
    transform: [{ rotate: '-45deg' }],
  },
  subjectSnowCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.78,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  foreground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
  },
  foregroundBeam: {
    position: 'absolute',
    top: -118,
    left: '42%',
    width: 92,
    height: 760,
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.20,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  foregroundBeamAlt: {
    position: 'absolute',
    top: 36,
    left: '6%',
    width: 58,
    height: 420,
    borderRadius: 999,
  },
  foregroundGlint: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.78,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  foregroundStar: {
    backgroundColor: 'rgba(255,247,214,0.96)',
    shadowColor: '#FFF7D6',
  },
  wetSheen: {
    position: 'absolute',
    top: 116,
    left: -80,
    width: 170,
    height: 520,
    borderRadius: 999,
    shadowColor: '#DDEEFF',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  foregroundRainDrop: {
    position: 'absolute',
    width: 1.8,
    borderRadius: 999,
    shadowColor: '#DDEEFF',
    shadowOpacity: 0.38,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  foregroundSnowGlow: {
    position: 'absolute',
    left: -30,
    right: -30,
    bottom: 18,
    height: 120,
    borderRadius: 999,
  },
  foregroundSnowFlake: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.86,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  foregroundVeil: {
    position: 'absolute',
    left: -120,
    right: -120,
    top: 168,
    height: 112,
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  foregroundVeilAlt: {
    top: 318,
    height: 84,
  },
  foregroundWind: {
    position: 'absolute',
    left: -260,
    height: 3,
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  foregroundWindCap: {
    position: 'absolute',
    right: -18,
    top: -4,
    width: 34,
    height: 11,
    borderRadius: 999,
    opacity: 0.46,
  },
  foregroundNightSheen: {
    position: 'absolute',
    top: -72,
    left: '18%',
    width: 52,
    height: 520,
    borderRadius: 999,
    backgroundColor: 'rgba(255,247,214,0.28)',
  },
  foregroundFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  skyTop: {
    ...StyleSheet.absoluteFillObject,
  },
  skyMid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    opacity: 0.78,
  },
  skyLow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '34%',
    opacity: 0.82,
  },
  skySheen: {
    position: 'absolute',
    top: -80,
    bottom: -120,
    left: '36%',
    width: 86,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.48)',
  },
  horizonGlow: {
    position: 'absolute',
    left: -80,
    right: -80,
    top: '48%',
    height: 76,
    borderRadius: 999,
  },
  glowOne: {
    position: 'absolute',
    top: 58,
    right: 24,
    width: 170,
    height: 170,
    borderRadius: 85,
    opacity: 0.9,
  },
  glowTwo: {
    position: 'absolute',
    left: -42,
    bottom: 80,
    width: 260,
    height: 150,
    borderRadius: 130,
    opacity: 0.28,
  },
  sun: {
    position: 'absolute',
    top: 82,
    right: 30,
    width: 142,
    height: 142,
    borderRadius: 71,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRayRing: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRayRingShort: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.72,
  },
  sunRaySlot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  sunRay: {
    width: 4,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.74)',
    shadowColor: '#FFF2A8',
    shadowOpacity: 0.82,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  sunRayShort: {
    width: 2.5,
    height: 21,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  sunGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  sunCore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    shadowColor: '#FFD166',
    shadowOpacity: 0.92,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  sunCoreHighlight: {
    position: 'absolute',
    top: 13,
    left: 16,
    width: 22,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  lightMote: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.54,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  moon: {
    position: 'absolute',
    top: 86,
    right: 44,
    width: 82,
    height: 82,
    borderRadius: 41,
    shadowColor: '#FFF7D6',
    shadowOpacity: 0.66,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  moonCraterLarge: {
    position: 'absolute',
    top: 18,
    left: 22,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(148,163,184,0.20)',
  },
  moonCraterSmall: {
    position: 'absolute',
    top: 44,
    left: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148,163,184,0.16)',
  },
  moonShadow: {
    position: 'absolute',
    top: -5,
    right: -12,
    width: 68,
    height: 92,
    borderRadius: 46,
    opacity: 0.82,
  },
  star: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  shootingStar: {
    position: 'absolute',
    top: 72,
    left: -80,
    width: 118,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  shootingStarCore: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.96)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.84,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  cloudOne: {
    position: 'absolute',
    top: 126,
    left: -38,
  },
  cloudTwo: {
    position: 'absolute',
    top: 80,
    right: -44,
    opacity: 0.72,
  },
  cloudThree: {
    position: 'absolute',
    top: 190,
    left: -86,
    opacity: 0.34,
  },
  cloud: {
    width: 172,
    height: 54,
    borderRadius: 27,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.20,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  cloudCompact: {
    width: 136,
    height: 44,
    borderRadius: 22,
  },
  cloudSoft: {
    opacity: 0.72,
    transform: [{ scale: 0.82 }],
  },
  cloudShade: {
    position: 'absolute',
    left: 20,
    right: 18,
    bottom: 5,
    height: 15,
    borderRadius: 999,
    backgroundColor: 'rgba(51,65,85,0.08)',
  },
  cloudShadeCompact: {
    left: 18,
    right: 16,
    height: 12,
  },
  cloudLobeLeft: {
    position: 'absolute',
    left: 26,
    bottom: 18,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cloudLobeRight: {
    position: 'absolute',
    right: 20,
    bottom: 10,
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  cloudLobeRightCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cloudHighlight: {
    position: 'absolute',
    left: 34,
    right: 42,
    top: 9,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  cloudHighlightCompact: {
    left: 26,
    right: 36,
    top: 7,
    height: 10,
  },
  wisp: {
    position: 'absolute',
    height: 12,
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.20,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  rainDrop: {
    position: 'absolute',
    width: 1.6,
    borderRadius: 999,
    shadowColor: '#DDEEFF',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  rainDropBack: {
    width: 1,
    opacity: 0.18,
  },
  rainHaze: {
    position: 'absolute',
    left: -40,
    right: -40,
    bottom: 18,
    height: 72,
    borderRadius: 999,
    opacity: 0.08,
  },
  ripple: {
    position: 'absolute',
    height: 9,
    marginLeft: -18,
    borderWidth: 1,
    borderRadius: 999,
  },
  rippleBack: {
    height: 7,
  },
  snowFlake: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.74,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  snowFlakeBack: {
    shadowOpacity: 0.32,
    shadowRadius: 7,
  },
  snowSparkle: {
    position: 'absolute',
    borderTopWidth: 1.4,
    borderBottomWidth: 1.4,
    borderLeftWidth: 1.4,
    borderRightWidth: 1.4,
    borderColor: 'rgba(255,255,255,0.82)',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.52,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  mist: {
    position: 'absolute',
    left: -120,
    width: 380,
    height: 74,
    borderRadius: 37,
    opacity: 0.2,
  },
  mistOne: {
    top: 138,
  },
  mistTwo: {
    top: 250,
    opacity: 0.15,
  },
  fogLine: {
    position: 'absolute',
    left: -120,
    width: 360,
    height: 2,
    borderRadius: 999,
  },
  fogLineOne: {
    top: 196,
  },
  fogLineTwo: {
    top: 344,
  },
  windStreak: {
    position: 'absolute',
    left: 0,
    height: 2,
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  windStreakCap: {
    position: 'absolute',
    right: -12,
    top: -3,
    width: 24,
    height: 8,
    borderRadius: 999,
    opacity: 0.48,
  },
  windLeaf: {
    position: 'absolute',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  stormStreakHigh: {
    position: 'absolute',
    top: '18%',
    left: '-8%',
    right: '-8%',
    height: 3,
    backgroundColor: '#FDE68A',
    transform: [{ rotate: '-8deg' }],
    shadowColor: '#FDE68A',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  stormStreakLow: {
    position: 'absolute',
    top: '22%',
    left: '14%',
    right: '-8%',
    height: 2,
    backgroundColor: '#FDE68A',
    transform: [{ rotate: '-12deg' }],
    shadowColor: '#FDE68A',
    shadowOpacity: 0.6,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  stormBolt: {
    position: 'absolute',
    top: 112,
    right: 72,
    shadowColor: '#FDE68A',
    shadowOpacity: 0.84,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  electricRing: {
    position: 'absolute',
    top: 118,
    right: 58,
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.52)',
    backgroundColor: 'rgba(196,181,253,0.08)',
  },
  sunCoronaMid: {
    position: 'absolute',
    width: 244,
    height: 244,
    borderRadius: 122,
    opacity: 0.42,
  },
  sunCoronaOuter: {
    position: 'absolute',
    width: 318,
    height: 318,
    borderRadius: 159,
    opacity: 0.18,
  },
  moonHalo: {
    position: 'absolute',
    width: 122,
    height: 122,
    borderRadius: 61,
    top: -20,
    left: -20,
    borderWidth: 1,
    borderColor: 'rgba(255,247,214,0.32)',
    backgroundColor: 'rgba(255,247,214,0.07)',
  },
  moonHaloOuter: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    top: -41,
    left: -41,
    borderWidth: 1,
    borderColor: 'rgba(255,247,214,0.14)',
    backgroundColor: 'rgba(255,247,214,0.03)',
  },
  nebula: {
    position: 'absolute',
    top: 24,
    left: -80,
    width: 320,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(78,52,140,0.09)',
    transform: [{ rotate: '-20deg' }],
  },
  mistThree: {
    top: 310,
    opacity: 0.11,
  },
  mistFour: {
    top: 390,
    opacity: 0.09,
  },
  hill: {
    position: 'absolute',
    left: -60,
    right: -60,
    bottom: -72,
    height: 190,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
  },
  hillFar: {
    position: 'absolute',
    left: -20,
    right: -80,
    bottom: -28,
    height: 140,
    borderTopLeftRadius: 300,
    borderTopRightRadius: 160,
    opacity: 0.44,
  },
  cityLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 0,
    height: 82,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    opacity: 0.82,
  },
  tower: {
    width: 28,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  forestLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    height: 110,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    opacity: 0.82,
  },
  pine: {
    width: 0,
    height: 0,
    borderLeftWidth: 28,
    borderRightWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
