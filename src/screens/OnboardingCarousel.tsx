import React, { useRef, useState, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform,
  StatusBar, ScrollView, Dimensions,
} from 'react-native';
import { AppColors, AppFonts, ThemeName, isY2KTheme, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    kicker: 'WEATHER-POWERED',
    headline: 'The sky sets\nthe dress code.',
    body: 'Real-time conditions from your city — temperature, humidity, wind — translated into a complete outfit brief.',
  },
  {
    kicker: 'EDITORIALLY CURATED',
    headline: 'AI with taste.\nNot just data. \nThe forecast\nis not enough.',
    body: 'You need a verdict. Real conditions from your city — temperature, rain, wind — translated into what to wear, what to avoid, and why. Claude Sonnet reads the weather and delivers verdicts with the confidence of a fashion editor who has seen everything.',
  },
  {
    kicker: 'UNIQUELY YOURS',
    headline: 'The Oracle\nlearns your eye.',
    body: 'Your aesthetic, your budget, your cities. Every consult is tailored. None are generic.',
  },
];

interface Props {
  onContinue: () => void;
  onSkip?: () => void;
}

export function OnboardingCarousel({ onContinue, onSkip }: Props) {
  const { colors, fonts, isDark, themeName } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts, themeName), [colors, fonts, themeName]);
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

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
            {/* Ghost slide number — editorial backdrop */}
            <Text style={styles.ghostNum}>{i + 1}</Text>
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

function makeStyles(colors: AppColors, fonts: AppFonts, themeName: ThemeName) {
  const isY2K = isY2KTheme(themeName);

  return StyleSheet.create({
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
    overflow: 'visible',
  },
  ghostNum: {
    position: 'absolute',
    right: -16,
    top: spacing.sm,
    fontFamily: fonts.displayLight,
    fontSize: 200,
    lineHeight: isY2K ? 240 : 200,
    color: colors.textPrimary,
    opacity: 0.05,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 3,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: fonts.displayBold,
    fontSize: 60,
    color: colors.textPrimary,
    lineHeight: isY2K ? 78 : 64,
    letterSpacing: -1.5,
    marginBottom: spacing.lg,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: isY2K ? 30 : 26,
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
  });
}
