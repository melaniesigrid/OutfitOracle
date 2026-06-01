import React, { useEffect, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_WIDTH = Math.min(screenWidth - 32, 430);

// 8 ice crystals with varied positions and timings
const ICE_CRYSTALS = [
  { left: 0.08, fallDur: 9200,  spinDur: 7000,  delay: 0,     size: 6,  opacity: 0.54 },
  { left: 0.20, fallDur: 11400, spinDur: 9400,  delay: 1800,  size: 9,  opacity: 0.72 },
  { left: 0.35, fallDur: 8800,  spinDur: 6400,  delay: 3200,  size: 6,  opacity: 0.50 },
  { left: 0.48, fallDur: 12200, spinDur: 11000, delay: 600,   size: 11, opacity: 0.80 },
  { left: 0.61, fallDur: 9600,  spinDur: 8200,  delay: 4400,  size: 7,  opacity: 0.60 },
  { left: 0.74, fallDur: 10600, spinDur: 7800,  delay: 2400,  size: 8,  opacity: 0.64 },
  { left: 0.86, fallDur: 11000, spinDur: 10400, delay: 1000,  size: 6,  opacity: 0.48 },
  { left: 0.93, fallDur: 8400,  spinDur: 6800,  delay: 3800,  size: 10, opacity: 0.68 },
];

// 5 wind streaks
const WIND_STREAKS = [
  { top: 88,  width: 160, opacity: 0.38, delay: 0 },
  { top: 152, width: 220, opacity: 0.28, delay: 900 },
  { top: 228, width: 180, opacity: 0.24, delay: 1800 },
  { top: 312, width: 240, opacity: 0.20, delay: 600 },
  { top: 388, width: 190, opacity: 0.16, delay: 2400 },
];

export function ColdWeatherAnimation({ borderRadius = 38, style }: Props) {
  const [, setWidth] = useState(DEFAULT_WIDTH);

  // Orb (cold sun/moon) pulse
  const orbPulse = useSharedValue(0);
  const orbRing  = useSharedValue(0);

  // Frost corners
  const frost = useSharedValue(0);

  // Ice crystal fall + spin (8 crystals × 2 values each)
  const fall0 = useSharedValue(0); const spin0 = useSharedValue(0);
  const fall1 = useSharedValue(0); const spin1 = useSharedValue(0);
  const fall2 = useSharedValue(0); const spin2 = useSharedValue(0);
  const fall3 = useSharedValue(0); const spin3 = useSharedValue(0);
  const fall4 = useSharedValue(0); const spin4 = useSharedValue(0);
  const fall5 = useSharedValue(0); const spin5 = useSharedValue(0);
  const fall6 = useSharedValue(0); const spin6 = useSharedValue(0);
  const fall7 = useSharedValue(0); const spin7 = useSharedValue(0);
  const fallValues = [fall0, fall1, fall2, fall3, fall4, fall5, fall6, fall7];
  const spinValues = [spin0, spin1, spin2, spin3, spin4, spin5, spin6, spin7];

  // Wind streaks (5)
  const wind0 = useSharedValue(0);
  const wind1 = useSharedValue(0);
  const wind2 = useSharedValue(0);
  const wind3 = useSharedValue(0);
  const wind4 = useSharedValue(0);
  const windValues = [wind0, wind1, wind2, wind3, wind4];

  useEffect(() => {
    orbPulse.value = withRepeat(
      withTiming(1, { duration: 5800, easing: Easing.inOut(Easing.ease) }), -1, true);
    orbRing.value = withRepeat(
      withTiming(1, { duration: 4400, easing: Easing.inOut(Easing.ease) }), -1, true);
    frost.value = withRepeat(
      withTiming(1, { duration: 4800, easing: Easing.inOut(Easing.ease) }), -1, true);

    ICE_CRYSTALS.forEach((c, i) => {
      fallValues[i].value = withDelay(c.delay, withRepeat(
        withTiming(1, { duration: c.fallDur, easing: Easing.linear }), -1, false));
      spinValues[i].value = withDelay(c.delay, withRepeat(
        withTiming(360, { duration: c.spinDur, easing: Easing.linear }), -1, false));
    });

    WIND_STREAKS.forEach((w, i) => {
      windValues[i].value = withDelay(w.delay, withRepeat(
        withTiming(1, { duration: 5000 + i * 800, easing: Easing.linear }), -1, false));
    });
  }, [
    orbPulse, orbRing, frost,
    fall0, fall1, fall2, fall3, fall4, fall5, fall6, fall7,
    spin0, spin1, spin2, spin3, spin4, spin5, spin6, spin7,
    wind0, wind1, wind2, wind3, wind4,
  ]);

  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const next = nativeEvent.layout.width;
    if (next > 0) setWidth(next);
  };

  const orbStyle = useAnimatedStyle(() => ({
    opacity: interpolate(orbPulse.value, [0, 1], [0.72, 1]),
    transform: [{ scale: interpolate(orbPulse.value, [0, 1], [0.94, 1.07]) }],
  }));

  const orbRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(orbRing.value, [0, 1], [0.24, 0.52]),
    transform: [{ scale: interpolate(orbRing.value, [0, 1], [0.86, 1.22]) }],
  }));

  const frostStyle = useAnimatedStyle(() => ({
    opacity: interpolate(frost.value, [0, 1], [0.44, 0.72]),
  }));

  // Build ice crystal animated styles
  const iceStyles = ICE_CRYSTALS.map((c, i) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fallStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: interpolate(fallValues[i].value, [0, 1], [-24, 720]) }],
      opacity: c.opacity,
    }));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const spinStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${spinValues[i].value}deg` }],
    }));
    return { fallStyle, spinStyle };
  });

  // Wind streak animated styles
  const windStyles = WIND_STREAKS.map((w, i) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAnimatedStyle(() => ({
      transform: [{ translateX: interpolate(windValues[i].value, [0, 1], [-280, screenWidth + 100]) }],
      opacity: w.opacity,
    }));
  });

  return (
    <View
      pointerEvents="none"
      onLayout={handleLayout}
      style={[StyleSheet.absoluteFill, styles.card, { borderRadius }, style]}
    >
      {/* Sky: deep navy → icy blue */}
      <LinearGradient
        colors={['#050d1e', '#0e2248', '#1a4080', '#2e72b8', '#6aadda', '#b4d8f0', '#e8f4fc']}
        locations={[0, 0.12, 0.30, 0.50, 0.68, 0.84, 1]}
        start={{ x: 0.42, y: 0 }}
        end={{ x: 0.58, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top glass bevel */}
      <LinearGradient
        colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={styles.bevel}
      />

      {/* Frost corners */}
      <Animated.View style={[styles.frostTopLeft,  frostStyle]} />
      <Animated.View style={[styles.frostTopRight, frostStyle]} />
      <Animated.View style={[styles.frostBotLeft,  frostStyle]} />
      <Animated.View style={[styles.frostBotRight, frostStyle]} />

      {/* Orb (cold sun/moon) */}
      <Animated.View style={[styles.orbSystem, orbStyle]}>
        <Animated.View style={[styles.orbRingFar,  orbRingStyle]} />
        <Animated.View style={[styles.orbRingNear, orbRingStyle]} />
        <View style={styles.orb}>
          <LinearGradient
            colors={['#ffffff', '#ddf0ff', '#9ecfe8', '#6aadda']}
            locations={[0, 0.28, 0.66, 1]}
            start={{ x: 0.22, y: 0.08 }} end={{ x: 0.88, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
          />
          <View style={styles.orbHighlight} />
        </View>
      </Animated.View>

      {/* Wind streaks */}
      {WIND_STREAKS.map((w, i) => (
        <Animated.View
          key={`wind-${i}`}
          style={[
            styles.windStreak,
            { top: w.top, width: w.width },
            windStyles[i],
          ]}
        />
      ))}

      {/* Ice crystals */}
      {ICE_CRYSTALS.map((c, i) => (
        <Animated.View
          key={`ice-${i}`}
          style={[
            styles.iceParticle,
            { left: `${c.left * 100}%`, width: c.size, height: c.size },
            iceStyles[i].fallStyle,
          ]}
        >
          <Animated.View style={[StyleSheet.absoluteFill, iceStyles[i].spinStyle]}>
            <View style={styles.iceCrossV} />
            <View style={styles.iceCrossH} />
            <View style={[styles.iceCrossDiag, { transform: [{ rotate: '45deg' }] }]} />
          </Animated.View>
        </Animated.View>
      ))}

      {/* Ground with icy tint */}
      <LinearGradient
        colors={['rgba(8,24,68,0)', 'rgba(8,24,68,0.86)']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={styles.ground}
      />
      {/* Mountain silhouettes */}
      <View style={styles.mountainOne} />
      <View style={styles.mountainTwo} />
      <View style={styles.mountainThree} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#1a4080',
  },
  bevel: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 52,
    zIndex: 5,
  },
  frostTopLeft: {
    position: 'absolute',
    top: 0, left: 0,
    width: 140, height: 140,
    borderRadius: 140,
    backgroundColor: 'rgba(220,240,255,0.22)',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 14,
  },
  frostTopRight: {
    position: 'absolute',
    top: 0, right: 0,
    width: 120, height: 120,
    borderRadius: 120,
    backgroundColor: 'rgba(220,240,255,0.18)',
    transform: [{ translateX: 44 }, { translateY: -44 }],
    zIndex: 14,
  },
  frostBotLeft: {
    position: 'absolute',
    bottom: 0, left: 0,
    width: 110, height: 110,
    borderRadius: 110,
    backgroundColor: 'rgba(220,240,255,0.16)',
    transform: [{ translateX: -40 }, { translateY: 40 }],
    zIndex: 14,
  },
  frostBotRight: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 130, height: 130,
    borderRadius: 130,
    backgroundColor: 'rgba(220,240,255,0.14)',
    transform: [{ translateX: 48 }, { translateY: 48 }],
    zIndex: 14,
  },
  orbSystem: {
    position: 'absolute',
    top: 66,
    right: 44,
    width: 138,
    height: 138,
    zIndex: 4,
  },
  orbRingFar: {
    position: 'absolute',
    top: -52, left: -52, right: -52, bottom: -52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(180,220,255,0.22)',
  },
  orbRingNear: {
    position: 'absolute',
    top: -22, left: -22, right: -22, bottom: -22,
    borderRadius: 999,
    backgroundColor: 'rgba(130,200,240,0.18)',
  },
  orb: {
    position: 'absolute',
    top: 28, left: 28, right: 28, bottom: 28,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#aaddff',
    shadowOpacity: 0.9,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 0 },
  },
  orbHighlight: {
    position: 'absolute',
    top: 8, left: 10,
    width: 16, height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  windStreak: {
    position: 'absolute',
    left: 0,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(200,230,255,0.72)',
    zIndex: 7,
  },
  iceParticle: {
    position: 'absolute',
    top: -24,
    zIndex: 10,
  },
  iceCrossV: {
    position: 'absolute',
    left: '50%', top: 0,
    width: 1.5,
    height: '100%',
    marginLeft: -0.75,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  iceCrossH: {
    position: 'absolute',
    left: 0, top: '50%',
    width: '100%',
    height: 1.5,
    marginTop: -0.75,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  iceCrossDiag: {
    position: 'absolute',
    left: '50%', top: 0,
    width: 1.5,
    height: '100%',
    marginLeft: -0.75,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.50)',
  },
  ground: {
    position: 'absolute',
    left: -60, right: -60, bottom: -60,
    height: '44%',
    zIndex: 1,
  },
  // Triangle mountains using border trick
  mountainOne: {
    position: 'absolute',
    bottom: 56,
    left: '4%',
    width: 0, height: 0,
    borderLeftWidth: 110,
    borderRightWidth: 110,
    borderBottomWidth: 180,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(8,22,60,0.62)',
    zIndex: 2,
  },
  mountainTwo: {
    position: 'absolute',
    bottom: 56,
    left: '30%',
    width: 0, height: 0,
    borderLeftWidth: 130,
    borderRightWidth: 130,
    borderBottomWidth: 220,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(8,22,60,0.72)',
    zIndex: 2,
  },
  mountainThree: {
    position: 'absolute',
    bottom: 56,
    right: '2%',
    width: 0, height: 0,
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderBottomWidth: 160,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(8,22,60,0.54)',
    zIndex: 2,
  },
});
