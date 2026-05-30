import React, { useEffect, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SunnyWeatherAnimationProps = {
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  utcOffsetSeconds?: number;
};

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_WIDTH = Math.min(screenWidth - 32, 430);

const LONG_RAYS    = [0, 45, 90, 135, 180, 225, 270, 315];
const SHORT_RAYS   = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
const CORONA_SPOKES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

type SkyPeriod = 'sunrise' | 'day' | 'sunset';

function getSkyPeriod(utcOffsetSeconds?: number): SkyPeriod {
  const h = utcOffsetSeconds !== undefined
    ? Math.floor((Date.now() / 1000 + utcOffsetSeconds) / 3600) % 24
    : new Date().getHours();
  if (h >= 5 && h < 8) return 'sunrise';
  if (h >= 17 && h < 20) return 'sunset';
  return 'day';
}

const SKY_GRADIENTS = {
  sunrise: ['#1e2d7a', '#4a6ab8', '#b87898', '#e89068', '#f5b050', '#f0a040', '#e88030'] as const,
  day:     ['#3498e8', '#52b8ff', '#7eceff', '#a6e0ff', '#ffd87e', '#ffb06e', '#f08250'] as const,
  sunset:  ['#1a2560', '#5a3888', '#c04870', '#e86050', '#f09030', '#e87020', '#c04818'] as const,
} as const;

const SKY_LOCATIONS = [0, 0.14, 0.3, 0.48, 0.72, 0.88, 1] as const;

export function SunnyWeatherAnimation({
  borderRadius = 38,
  style,
  utcOffsetSeconds,
}: SunnyWeatherAnimationProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const skyColors = SKY_GRADIENTS[getSkyPeriod(utcOffsetSeconds)];

  const sunFloat = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const corePulse = useSharedValue(0);
  const raysClockwise = useSharedValue(0);
  const raysCounter = useSharedValue(0);
  const cloudOne = useSharedValue(0);
  const cloudTwo = useSharedValue(0);
  const cloudThree = useSharedValue(0);
  const hazePulse = useSharedValue(0);
  const particleDrift = useSharedValue(0);
  const flare      = useSharedValue(0);
  const coronaSpin = useSharedValue(0);

  useEffect(() => {
    sunFloat.value = withRepeat(
      withTiming(1, { duration: 7400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    glowPulse.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    corePulse.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    raysClockwise.value = withRepeat(
      withTiming(360, { duration: 22000, easing: Easing.linear }),
      -1,
      false,
    );

    raysCounter.value = withRepeat(
      withTiming(-360, { duration: 30000, easing: Easing.linear }),
      -1,
      false,
    );

    cloudOne.value = withRepeat(
      withTiming(1, { duration: 26000, easing: Easing.linear }),
      -1,
      false,
    );

    cloudTwo.value = withRepeat(
      withTiming(1, { duration: 38000, easing: Easing.linear }),
      -1,
      false,
    );

    cloudThree.value = withRepeat(
      withTiming(1, { duration: 52000, easing: Easing.linear }),
      -1,
      false,
    );

    hazePulse.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    particleDrift.value = withRepeat(
      withTiming(1, { duration: 9800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    flare.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );

    coronaSpin.value = withRepeat(
      withTiming(360, { duration: 58000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [
    cloudOne,
    cloudThree,
    cloudTwo,
    corePulse,
    coronaSpin,
    flare,
    glowPulse,
    hazePulse,
    particleDrift,
    raysClockwise,
    raysCounter,
    sunFloat,
  ]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0 && Math.abs(nextWidth - width) > 1) setWidth(nextWidth);
  };

  const sunAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(sunFloat.value, [0, 1], [0, -5]) },
      { translateY: interpolate(sunFloat.value, [0, 1], [0, 8]) },
      { scale: interpolate(sunFloat.value, [0, 1], [1, 1.026]) },
    ],
  }));

  const outerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.66, 1]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.92, 1.13]) }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(corePulse.value, [0, 1], [1, 1.044]) }],
    opacity: interpolate(corePulse.value, [0, 1], [0.92, 1]),
  }));

  const clockwiseRayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${raysClockwise.value}deg` }],
  }));

  const counterRayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${raysCounter.value}deg` }],
  }));

  const coronaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${coronaSpin.value}deg` }],
  }));

  const cloudOneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(cloudOne.value, [0, 1], [-120, width + 220]) },
      { scale: 0.84 },
    ],
  }));

  const cloudTwoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(cloudTwo.value, [0, 1], [width + 120, -260]) },
      { scale: 0.6 },
    ],
  }));

  const cloudThreeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(cloudThree.value, [0, 1], [-120, width + 260]) },
      { scale: 0.72 },
    ],
  }));

  const hazeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hazePulse.value, [0, 1], [0.55, 0.9]),
    transform: [{ scaleX: interpolate(hazePulse.value, [0, 1], [1, 1.1]) }],
  }));

  const flareStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flare.value, [0, 0.3, 0.45, 0.58, 0.7, 1], [0, 0, 1, 1, 0, 0]),
    transform: [
      { rotate: '-28deg' },
      { scaleX: interpolate(flare.value, [0, 0.45, 0.7, 1], [0.6, 1, 1.3, 0.6]) },
    ],
  }));

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(particleDrift.value, [0, 1], [-13, 15]) },
      { translateY: interpolate(particleDrift.value, [0, 1], [9, -15]) },
    ],
    opacity: interpolate(particleDrift.value, [0, 1], [0.2, 0.74]),
  }));

  return (
    <View
      pointerEvents="none"
      onLayout={handleLayout}
      style={[
        StyleSheet.absoluteFill,
        styles.card,
        { borderRadius },
        style,
      ]}
    >
      <LinearGradient
        colors={skyColors}
        locations={SKY_LOCATIONS}
        start={{ x: 0.42, y: 0 }}
        end={{ x: 0.62, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top glass bevel */}
      <LinearGradient
        colors={['rgba(255,255,255,0.40)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.cardBevel}
      />
      {/* Specular highlight — main + focused core */}
      <View style={styles.topHighlight} />
      <View style={styles.topHighlightCore} />
      <View style={styles.leftHighlight} />

      <Animated.View style={[styles.sunSystem, sunAnimatedStyle]}>
        {/* Slowly rotating corona — 12 subtle spokes at 58s */}
        <Animated.View style={[styles.coronaRing, coronaStyle]}>
          {CORONA_SPOKES.map(angle => (
            <View key={`corona-${angle}`} style={[styles.coronaArm, { transform: [{ rotate: `${angle}deg` }] }]}>
              <View style={styles.coronaSpoke} />
            </View>
          ))}
        </Animated.View>
        <Animated.View style={[styles.sunGlowOuter, outerGlowStyle]} />
        <Animated.View style={[styles.sunGlow, outerGlowStyle]} />
        <Animated.View style={[styles.sunGlowInner, outerGlowStyle]} />

        <Animated.View style={[styles.rayRing, clockwiseRayStyle]}>
          {LONG_RAYS.map(angle => (
            <View key={`long-${angle}`} style={[styles.rayArm, { transform: [{ rotate: `${angle}deg` }] }]}>
              <LinearGradient
                colors={['rgba(255,246,184,0)', 'rgba(255,246,184,0.90)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.longRay}
              />
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.rayRing, counterRayStyle]}>
          {SHORT_RAYS.map(angle => (
            <View key={`short-${angle}`} style={[styles.rayArm, { transform: [{ rotate: `${angle}deg` }] }]}>
              <LinearGradient
                colors={['rgba(255,246,184,0)', 'rgba(255,246,184,0.54)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.shortRay}
              />
            </View>
          ))}
        </Animated.View>

        <View style={styles.sunHalo} />
        <View style={styles.sunHaloMid} />
        <View style={styles.sunHaloFar} />
        <Animated.View style={[styles.sunCore, coreStyle]}>
          <LinearGradient
            colors={['#fffef8', '#fff6b8', '#ffe87c', '#f5a420', '#e08018']}
            locations={[0, 0.24, 0.55, 0.82, 1]}
            start={{ x: 0.18, y: 0.08 }}
            end={{ x: 0.92, y: 0.98 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
          />
          <View style={styles.sunCoreHighlight} />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.hazeOuter, hazeStyle]} />
      <Animated.View style={[styles.hazeMid,   hazeStyle]} />
      <Animated.View style={[styles.hazeInner, hazeStyle]} />
      <LinearGradient
        colors={['transparent', 'rgba(255,248,204,0.72)', 'rgba(255,248,204,0.80)', 'rgba(255,248,204,0.72)', 'transparent']}
        locations={[0, 0.22, 0.5, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.horizonLine}
      />
      <Animated.View style={[styles.lensFlare, flareStyle]} />
      <Animated.View style={[styles.lensFlareSecondary, flareStyle]} />

      <Animated.View style={[styles.cloud, styles.cloudOne, cloudOneStyle]}>
        <View style={styles.cloudInnerGlow} />
        <View style={[styles.cloudBump, styles.cloudOneBumpA]} />
        <View style={[styles.cloudBump, styles.cloudOneBumpB]} />
      </Animated.View>

      <Animated.View style={[styles.cloud, styles.cloudTwo, cloudTwoStyle]}>
        <View style={styles.cloudInnerGlow} />
        <View style={[styles.cloudBump, styles.cloudTwoBumpA]} />
        <View style={[styles.cloudBump, styles.cloudTwoBumpB]} />
      </Animated.View>

      <Animated.View style={[styles.cloud, styles.cloudThree, cloudThreeStyle]}>
        <View style={styles.cloudInnerGlow} />
        <View style={[styles.cloudBump, styles.cloudThreeBumpA]} />
        <View style={[styles.cloudBump, styles.cloudThreeBumpB]} />
      </Animated.View>

      <Animated.View style={[styles.particle, styles.particleA, particleStyle]} />
      <Animated.View style={[styles.particle, styles.particleB, particleStyle]} />
      <Animated.View style={[styles.particle, styles.particleC, particleStyle]} />
      <Animated.View style={[styles.particle, styles.particleD, particleStyle]} />
      <Animated.View style={[styles.particle, styles.particleE, particleStyle]} />

      <View style={styles.groundBase}>
        <LinearGradient
          colors={['rgba(10,44,18,0)', 'rgba(10,44,18,0.88)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.hillLeft}>
        <LinearGradient
          colors={['rgba(20,80,36,0)', 'rgba(20,80,36,0.88)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.hillRight}>
        <LinearGradient
          colors={['rgba(32,100,48,0)', 'rgba(32,100,48,0.68)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.hillMid}>
        <LinearGradient
          colors={['rgba(14,60,28,0)', 'rgba(14,60,28,0.76)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#52b8ff',
  },
  cardBevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    zIndex: 5,
  },
  topHighlight: {
    position: 'absolute',
    top: -24,
    right: 24,
    width: 210,
    height: 100,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.44)',
    transform: [{ rotate: '-10deg' }],
  },
  topHighlightCore: {
    position: 'absolute',
    top: -6,
    right: 52,
    width: 90,
    height: 46,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.66)',
    transform: [{ rotate: '-10deg' }],
  },
  leftHighlight: {
    position: 'absolute',
    top: -28,
    left: 20,
    width: 130,
    height: 70,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  sunSystem: {
    position: 'absolute',
    top: 64,
    right: 50,
    width: 154,
    height: 154,
    zIndex: 3,
  },
  sunGlowOuter: {
    position: 'absolute',
    top: -66,
    left: -66,
    right: -66,
    bottom: -66,
    borderRadius: 999,
    backgroundColor: 'rgba(255,210,100,0.2)',
  },
  sunGlow: {
    position: 'absolute',
    top: -38,
    left: -38,
    right: -38,
    bottom: -38,
    borderRadius: 999,
    backgroundColor: 'rgba(255,246,184,0.38)',
  },
  sunGlowInner: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,240,148,0.60)',
  },
  coronaRing: {
    position: 'absolute',
    top: -62,
    left: -62,
    right: -62,
    bottom: -62,
    borderRadius: 999,
  },
  coronaArm: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
  },
  coronaSpoke: {
    width: 2.5,
    height: 54,
    borderRadius: 999,
    backgroundColor: 'rgba(255,218,90,0.08)',
  },
  rayRing: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  rayArm: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
  },
  longRay: {
    width: 3.5,
    height: 30,
    borderRadius: 999,
    shadowColor: '#fff6b8',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  shortRay: {
    width: 2.5,
    height: 17,
    borderRadius: 999,
    marginTop: 8,
  },
  sunHalo: {
    position: 'absolute',
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderRadius: 999,
    borderWidth: 5,
    borderColor: 'rgba(255,246,200,0.22)',
  },
  sunHaloMid: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,236,160,0.13)',
  },
  sunHaloFar: {
    position: 'absolute',
    top: -18,
    left: -18,
    right: -18,
    bottom: -18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,218,100,0.07)',
  },
  sunCore: {
    position: 'absolute',
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#ffd766',
    shadowOpacity: 1,
    shadowRadius: 56,
    shadowOffset: { width: 0, height: 0 },
  },
  sunCoreHighlight: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 18,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.44)',
  },
  hazeOuter: {
    position: 'absolute',
    left: -160,
    right: -160,
    top: '44%',
    height: 130,
    borderRadius: 130,
    backgroundColor: 'rgba(255,218,120,0.08)',
    zIndex: 1,
  },
  hazeMid: {
    position: 'absolute',
    left: -130,
    right: -130,
    top: '45%',
    height: 112,
    borderRadius: 112,
    backgroundColor: 'rgba(255,218,120,0.14)',
    zIndex: 1,
  },
  hazeInner: {
    position: 'absolute',
    left: -90,
    right: -90,
    top: '46.5%',
    height: 90,
    borderRadius: 90,
    backgroundColor: 'rgba(255,218,120,0.22)',
    zIndex: 1,
  },
  horizonLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '59%',
    height: 1.5,
    zIndex: 2,
  },
  lensFlare: {
    position: 'absolute',
    top: 98,
    right: 32,
    width: 130,
    height: 1.5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 4,
  },
  lensFlareSecondary: {
    position: 'absolute',
    top: 108,
    right: 68,
    width: 60,
    height: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.48)',
    zIndex: 4,
  },
  cloud: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.48)',
    zIndex: 2,
    shadowColor: '#ffffff',
    shadowOpacity: 0.28,
    shadowRadius: 28,
  },
  cloudBump: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.48)',
  },
  cloudInnerGlow: {
    position: 'absolute',
    top: 0,
    left: '8%',
    right: '8%',
    height: '55%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  cloudOne: {
    width: 176,
    height: 56,
    top: 178,
    left: 0,
    opacity: 0.44,
  },
  cloudOneBumpA: {
    width: 78,
    height: 78,
    left: 28,
    bottom: 20,
  },
  cloudOneBumpB: {
    width: 98,
    height: 98,
    right: 22,
    bottom: 10,
  },
  cloudTwo: {
    width: 170,
    height: 52,
    top: 114,
    left: 0,
    opacity: 0.24,
  },
  cloudTwoBumpA: {
    width: 72,
    height: 72,
    left: 24,
    bottom: 16,
  },
  cloudTwoBumpB: {
    width: 90,
    height: 90,
    right: 20,
    bottom: 8,
  },
  cloudThree: {
    width: 240,
    height: 20,
    top: 68,
    left: 0,
    opacity: 0.14,
  },
  cloudThreeBumpA: {
    width: 56,
    height: 26,
    left: 44,
    bottom: 6,
  },
  cloudThreeBumpB: {
    width: 66,
    height: 22,
    right: 36,
    bottom: 3,
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.56)',
    zIndex: 3,
  },
  particleA: {
    width: 6,
    height: 6,
    top: 152,
    left: 54,
  },
  particleB: {
    width: 4,
    height: 4,
    top: 242,
    right: 62,
  },
  particleC: {
    width: 9,
    height: 9,
    bottom: 192,
    left: 40,
    opacity: 0.22,
  },
  particleD: {
    width: 3,
    height: 3,
    top: 194,
    left: '38%',
    opacity: 0.36,
  },
  particleE: {
    width: 5,
    height: 5,
    top: 308,
    right: '29%',
    opacity: 0.2,
  },
  groundBase: {
    position: 'absolute',
    left: -60,
    right: -60,
    bottom: -60,
    height: '46%',
    zIndex: 1,
  },
  hillLeft: {
    position: 'absolute',
    left: -80,
    bottom: -200,
    width: 330,
    height: 300,
    borderRadius: 165,
    overflow: 'hidden',
    zIndex: 2,
  },
  hillRight: {
    position: 'absolute',
    right: -70,
    bottom: -210,
    width: 350,
    height: 300,
    borderRadius: 175,
    overflow: 'hidden',
    zIndex: 2,
  },
  hillMid: {
    position: 'absolute',
    left: '12%',
    bottom: -165,
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
    zIndex: 3,
  },
});
