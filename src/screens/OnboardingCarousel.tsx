import React, { useRef, useState, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform,
  StatusBar, ScrollView, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'weather-partly-cloudy' as const,
    kicker: 'WEATHER-POWERED',
    headline: 'The sky sets\nthe dress code.',
    body: 'Real-time conditions from your city — temperature, humidity, wind — translated into a complete outfit brief.',
  },
  {
    icon: 'eye-outline' as const,
    kicker: 'EDITORIALLY CURATED',
    headline: 'AI with taste.\nNot just data.',
    body: 'Claude Sonnet reads the weather and delivers verdicts with the confidence of a fashion editor who has seen everything.',
  },
  {
    icon: 'crown-outline' as const,
    kicker: 'UNIQUELY YOURS',
    headline: 'The Oracle\nlearns your eye.',
    body: 'Your aesthetic, your budget, your city history. Every consultation gets sharper. Every verdict gets closer to perfect.',
  },
];

interface Props {
  onContinue: () => void;
  onSkip?: () => void;
}

export function OnboardingCarousel({ onContinue, onSkip }: Props) {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) { onContinue(); return; }
    const next = page + 1;
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setPage(next);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {onSkip && (
        <Pressable
          style={styles.skipBtn}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip intro"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scroll}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={styles.slide}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons
                name={slide.icon}
                size={52}
                color={colors.scarlet}
              />
            </View>
            <Text style={styles.kicker}>{slide.kicker}</Text>
            <Text style={styles.headline}>{slide.headline}</Text>
            <View style={styles.rule} />
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Continue to setup' : 'Next slide'}
        >
          <Text style={styles.nextText}>
            {isLast ? 'Choose Your Oracle →' : 'Next →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) { return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  skipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  slide: {
    width,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'flex-start',
  },
  iconWrap: {
    marginBottom: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.textPrimary,
    lineHeight: 54,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 20,
    height: 2,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.textPrimary,
  },
  nextBtn: {
    backgroundColor: colors.bgDark,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  nextBtnPressed: {
    opacity: 0.8,
  },
  nextText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: '#FAF9F6',
  },
}); }
