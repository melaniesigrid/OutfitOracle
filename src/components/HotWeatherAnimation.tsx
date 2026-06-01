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
const SUN_RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const SUN_RAYS_SHORT = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

export function HotWeatherAnimation({ borderRadius = 38, style }: Props) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const sunFloat   = useSharedValue(0);
  const glowPulse  = useSharedValue(0);
  const corePulse  = useSharedValue(0);
  const raySpin    = useSharedValue(0);
  const raySpinRev = useSharedValue(0);
  const shimmer    = useSharedValue(0);
  const heat1      = useSharedValue(0);
  const heat2      = useSharedValue(0);
  const heat3      = useSharedValue(0);
  const heat4      = useSharedValue(0);
  const spark1     = useSharedValue(0);
  const spark2     = useSharedValue(0);
  const spark3     = useSharedValue(0);
  const horizonGlow = useSharedValue(0);

  useEffect(() => {
    sunFloat.value = withRepeat(
      withTiming(1, { duration: 5400, easing: Easing.inOut(Easing.ease) }), -1, true);
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }), -1, true);
    corePulse.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, true);
    raySpin.value = withRepeat(
      withTiming(360, { duration: 18000, easing: Easing.linear }), -1, false);
    raySpinRev.value = withRepeat(
      withTiming(-360, { duration: 28000, easing: Easing.linear }), -1, false);
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.ease) }), -1, true);
    horizonGlow.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.ease) }), -1, true);

    heat1.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.linear }), -1, false);
    heat2.value = withDelay(1100, withRepeat(
      withTiming(1, { duration: 5100, easing: Easing.linear }), -1, false));
    heat3.value = withDelay(2400, withRepeat(
      withTiming(1, { duration: 3800, easing: Easing.linear }), -1, false));
    heat4.value = withDelay(700, withRepeat(
      withTiming(1, { duration: 4600, easing: Easing.linear }), -1, false));

    spark1.value = withDelay(500, withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true));
    spark2.value = withDelay(1300, withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }), -1, true));
    spark3.value = withDelay(2100, withRepeat(
      withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [
    sunFloat, glowPulse, corePulse, raySpin, raySpinRev,
    shimmer, horizonGlow, heat1, heat2, heat3, heat4, spark1, spark2, spark3,
  ]);

  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const next = nativeEvent.layout.width;
    if (next > 0 && Math.abs(next - width) > 1) setWidth(next);
  };

  const sunStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(sunFloat.value, [0, 1], [0, -6]) },
      { translateY: interpolate(sunFloat.value, [0, 1], [0, 8]) },
      { scale: interpolate(sunFloat.value, [0, 1], [1, 1.025]) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.58, 0.90]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.88, 1.18]) }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(corePulse.value, [0, 1], [1, 1.07]) }],
  }));

  const rayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${raySpin.value}deg` }],
  }));

  const rayRevStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${raySpinRev.value}deg` }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-width * 0.5, width * 0.8]) }],
    opacity: interpolate(shimmer.value, [0, 0.4, 0.6, 1], [0, 0.14, 0.14, 0]),
  }));

  const horizonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(horizonGlow.value, [0, 1], [0.38, 0.66]),
    transform: [{ scaleX: interpolate(horizonGlow.value, [0, 1], [0.94, 1.08]) }],
  }));

  const heat1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(heat1.value, [0, 0.12, 0.82, 1], [90, 0, 0, -280]) }],
    opacity: interpolate(heat1.value, [0, 0.12, 0.72, 1], [0, 0.22, 0.22, 0]),
  }));
  const heat2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(heat2.value, [0, 0.12, 0.82, 1], [70, 0, 0, -250]) }],
    opacity: interpolate(heat2.value, [0, 0.12, 0.72, 1], [0, 0.16, 0.16, 0]),
  }));
  const heat3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(heat3.value, [0, 0.12, 0.82, 1], [110, 0, 0, -260]) }],
    opacity: interpolate(heat3.value, [0, 0.12, 0.72, 1], [0, 0.24, 0.24, 0]),
  }));
  const heat4Style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(heat4.value, [0, 0.12, 0.82, 1], [80, 0, 0, -270]) }],
    opacity: interpolate(heat4.value, [0, 0.12, 0.72, 1], [0, 0.18, 0.18, 0]),
  }));

  const spark1Style = useAnimatedStyle(() => ({
    opacity: interpolate(spark1.value, [0, 0.42, 0.68, 1], [0, 0.74, 0.18, 0]),
    transform: [{ scale: interpolate(spark1.value, [0, 0.42, 1], [0.28, 1.0, 0.66]) }],
  }));
  const spark2Style = useAnimatedStyle(() => ({
    opacity: interpolate(spark2.value, [0, 0.42, 0.68, 1], [0, 0.58, 0.12, 0]),
    transform: [{ scale: interpolate(spark2.value, [0, 0.42, 1], [0.32, 1.08, 0.60]) }],
  }));
  const spark3Style = useAnimatedStyle(() => ({
    opacity: interpolate(spark3.value, [0, 0.42, 0.68, 1], [0, 0.68, 0.14, 0]),
    transform: [{ scale: interpolate(spark3.value, [0, 0.42, 1], [0.24, 0.92, 0.58]) }],
  }));

  return (
    <View
      pointerEvents="none"
      onLayout={handleLayout}
      style={[StyleSheet.absoluteFill, styles.card, { borderRadius }, style]}
    >
      {/* Sky: amber → coral → peach */}
      <LinearGradient
        colors={['#7c2200', '#c94210', '#e8661a', '#f59638', '#fabe68', '#fde4b0', '#fff3dc']}
        locations={[0, 0.14, 0.32, 0.52, 0.70, 0.86, 1]}
        start={{ x: 0.42, y: 0 }}
        end={{ x: 0.58, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top glass bevel */}
      <LinearGradient
        colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bevel}
      />

      {/* Shimmer sweep */}
      <Animated.View style={[styles.shimmer, shimmerStyle]} />

      {/* Horizon heat glow */}
      <Animated.View style={[styles.horizonGlow, horizonStyle]} />

      {/* Heat waves — thin rising columns */}
      <Animated.View style={[styles.heatWave, { left: '7%',  width: 26 }, heat1Style]} />
      <Animated.View style={[styles.heatWave, { left: '27%', width: 38 }, heat2Style]} />
      <Animated.View style={[styles.heatWave, { left: '52%', width: 30 }, heat3Style]} />
      <Animated.View style={[styles.heatWave, { left: '76%', width: 42 }, heat4Style]} />

      {/* Sun system */}
      <Animated.View style={[styles.sunSystem, sunStyle]}>
        <Animated.View style={[styles.sunGlowFar,  glowStyle]} />
        <Animated.View style={[styles.sunGlowMid,  glowStyle]} />
        <Animated.View style={[styles.sunGlowNear, glowStyle]} />

        {/* Outer rays (clockwise) */}
        <Animated.View style={[styles.rayRing, rayStyle]}>
          {SUN_RAYS.map(angle => (
            <View key={`ray-${angle}`} style={[styles.rayArm, { transform: [{ rotate: `${angle}deg` }] }]}>
              <LinearGradient
                colors={['rgba(255,236,120,0)', 'rgba(255,236,120,0.86)']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={styles.rayLong}
              />
            </View>
          ))}
        </Animated.View>

        {/* Inner rays (counter-clockwise, shorter) */}
        <Animated.View style={[styles.rayRing, rayRevStyle]}>
          {SUN_RAYS_SHORT.map(angle => (
            <View key={`sray-${angle}`} style={[styles.rayArm, { transform: [{ rotate: `${angle}deg` }] }]}>
              <LinearGradient
                colors={['rgba(255,236,120,0)', 'rgba(255,236,120,0.52)']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={styles.rayShort}
              />
            </View>
          ))}
        </Animated.View>

        <View style={styles.sunHalo} />
        <Animated.View style={[styles.sunCore, coreStyle]}>
          <LinearGradient
            colors={['#fffeee', '#ffe870', '#f78c18', '#c94000']}
            locations={[0, 0.28, 0.66, 1]}
            start={{ x: 0.2, y: 0.08 }}
            end={{ x: 0.88, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
          />
          <View style={styles.sunHighlight} />
        </Animated.View>
      </Animated.View>

      {/* Sparkles */}
      <Animated.View style={[styles.spark, { left: '15%', top: '26%' }, spark1Style]}>
        <View style={styles.sparkCross} />
        <View style={[styles.sparkCross, styles.sparkCrossRotated]} />
      </Animated.View>
      <Animated.View style={[styles.spark, { left: '58%', top: '20%' }, spark2Style]}>
        <View style={styles.sparkCross} />
        <View style={[styles.sparkCross, styles.sparkCrossRotated]} />
      </Animated.View>
      <Animated.View style={[styles.spark, { left: '84%', top: '40%' }, spark3Style]}>
        <View style={styles.sparkCross} />
        <View style={[styles.sparkCross, styles.sparkCrossRotated]} />
      </Animated.View>

      {/* Ground */}
      <LinearGradient
        colors={['rgba(80,18,0,0)', 'rgba(80,18,0,0.78)']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={styles.ground}
      />
      {/* Hill silhouettes */}
      <View style={styles.hillLeft} />
      <View style={styles.hillRight} />
      <View style={styles.hillMid} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#e8661a',
  },
  bevel: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 52,
    zIndex: 5,
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ rotate: '-18deg' }, { scaleY: 1.4 }],
    zIndex: 6,
  },
  horizonGlow: {
    position: 'absolute',
    left: -120,
    right: -120,
    bottom: 110,
    height: 80,
    borderRadius: 80,
    backgroundColor: 'rgba(255,180,60,0.36)',
    zIndex: 2,
  },
  heatWave: {
    position: 'absolute',
    bottom: 60,
    height: 230,
    borderRadius: 999,
    backgroundColor: 'rgba(255,248,220,0.28)',
    zIndex: 3,
  },
  sunSystem: {
    position: 'absolute',
    top: 64,
    right: 44,
    width: 148,
    height: 148,
    zIndex: 4,
  },
  sunGlowFar: {
    position: 'absolute',
    top: -64, left: -64, right: -64, bottom: -64,
    borderRadius: 999,
    backgroundColor: 'rgba(255,160,30,0.18)',
  },
  sunGlowMid: {
    position: 'absolute',
    top: -36, left: -36, right: -36, bottom: -36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,200,60,0.32)',
  },
  sunGlowNear: {
    position: 'absolute',
    top: -12, left: -12, right: -12, bottom: -12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,230,100,0.56)',
  },
  rayRing: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  rayArm: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
  },
  rayLong: {
    width: 3.5,
    height: 28,
    borderRadius: 999,
  },
  rayShort: {
    width: 2.5,
    height: 15,
    borderRadius: 999,
    marginTop: 10,
  },
  sunHalo: {
    position: 'absolute',
    top: 8, left: 8, right: 8, bottom: 8,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: 'rgba(255,220,80,0.20)',
  },
  sunCore: {
    position: 'absolute',
    top: 38, left: 38, right: 38, bottom: 38,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#ffcc44',
    shadowOpacity: 1,
    shadowRadius: 52,
    shadowOffset: { width: 0, height: 0 },
  },
  sunHighlight: {
    position: 'absolute',
    top: 8, left: 9,
    width: 18, height: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  spark: {
    position: 'absolute',
    width: 14,
    height: 14,
    zIndex: 9,
  },
  sparkCross: {
    position: 'absolute',
    left: '50%', top: '50%',
    width: 2,
    height: 14,
    marginLeft: -1,
    marginTop: -7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,248,180,0.86)',
    shadowColor: '#fff6b4',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  sparkCrossRotated: {
    transform: [{ rotate: '90deg' }],
  },
  ground: {
    position: 'absolute',
    left: -60, right: -60, bottom: -60,
    height: '44%',
    zIndex: 1,
  },
  hillLeft: {
    position: 'absolute',
    left: -80, bottom: -200,
    width: 330, height: 300,
    borderRadius: 165,
    backgroundColor: 'rgba(80,20,0,0.72)',
    zIndex: 2,
  },
  hillRight: {
    position: 'absolute',
    right: -70, bottom: -210,
    width: 350, height: 300,
    borderRadius: 175,
    backgroundColor: 'rgba(80,20,0,0.56)',
    zIndex: 2,
  },
  hillMid: {
    position: 'absolute',
    left: '12%', bottom: -165,
    width: 280, height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(60,14,0,0.66)',
    zIndex: 3,
  },
});
