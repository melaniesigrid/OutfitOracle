import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { isY2KTheme } from '../theme';

const { width: SW } = Dimensions.get('window');

const COLORS_DEFAULT  = ['#C41230', '#FAF9F6', '#1A1714', '#DDD7CE', '#B0A898', '#C41230'];
const COLORS_ELECTRIC = ['#FF1060', '#FFFFFF', '#C8D0FF', '#FF1060', '#FFF', '#8090CC'];
const COLORS_WARM     = ['#B5491A', '#FAF9F6', '#D4873A', '#EDE4D5', '#B0997A', '#B5491A'];
const COLORS_Y2K      = ['#EC1E79', '#C7F238', '#D8C2F2', '#35106E', '#F6E85F', '#FFFBEF', '#7B5CA8'];

const COUNT = 55;

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)); }

interface Particle {
  x: number;
  color: string;
  w: number;
  h: number;
  delay: number;
  duration: number;
  startRot: number;
  endRot: number;
  translateY: Animated.Value;
  rotate: Animated.Value;
  rotDeg: Animated.AnimatedInterpolation<string>; // pre-computed, not created in render
  opacity: Animated.Value;
}

function makeParticles(colors: string[]): Particle[] {
  return Array.from({ length: COUNT }, () => {
    const startRot = rand(-60, 60);
    const endRot   = rand(-300, 300);
    const rotate   = new Animated.Value(0);
    return {
      x:         rand(0, SW - 14),
      color:     colors[randInt(0, colors.length - 1)],
      w:         rand(6, 13),
      h:         rand(4, 9),
      delay:     rand(0, 450),
      duration:  rand(1800, 2800),
      startRot,
      endRot,
      translateY: new Animated.Value(-20),
      rotate,
      rotDeg: rotate.interpolate({ inputRange: [0, 1], outputRange: [`${startRot}deg`, `${endRot}deg`] }),
      opacity:    new Animated.Value(1),
    };
  });
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 998,   // above navigation, below BadgeToast card (999)
    elevation: 9,
  },
});

interface Props {
  visible: boolean;
}

export function Confetti({ visible }: Props) {
  const { themeName } = useTheme();

  const colors =
    isY2KTheme(themeName)         ? COLORS_Y2K :
    themeName === 'electric'      ? COLORS_ELECTRIC :
    (themeName === 'terra-firma' || themeName === 'morning-paper' || themeName === 'golden-hour')
                                  ? COLORS_WARM :
    COLORS_DEFAULT;

  const particlesRef = useRef<Particle[] | null>(null);
  if (!particlesRef.current) {
    particlesRef.current = makeParticles(colors);
  }
  const particles = particlesRef.current;

  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (!visible) return;

    // Reset
    particles.forEach(p => {
      p.translateY.setValue(-20);
      p.rotate.setValue(0);
      p.opacity.setValue(1);
    });

    const anims = particles.map(p =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.translateY, {
            toValue: screenHeight + 40,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: 1,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(p.duration * 0.65),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: p.duration * 0.35,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    const composite = Animated.parallel(anims);
    composite.start();
    return () => composite.stop();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
      {particles.map((p, i) => {
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left:   p.x,
              top:    0,
              width:  p.w,
              height: p.h,
              backgroundColor: p.color,
              borderRadius: 1,
              transform: [
                { translateY: p.translateY },
                { rotate: p.rotDeg },
              ],
              opacity: p.opacity,
            }}
          />
        );
      })}
    </View>
  );
}
