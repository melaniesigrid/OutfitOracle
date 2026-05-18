import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform,
  StatusBar, Animated, Image, Dimensions,
} from 'react-native';
import { AppColors, AppFonts, ThemeName, isY2KTheme, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

const { height } = Dimensions.get('window');

interface Props {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: Props) {
  const { colors, fonts, themeName } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts, themeName), [colors, fonts, themeName]);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY       = useRef(new Animated.Value(24)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const ctaOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(logoY,       { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(tagOpacity, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.timing(ctaOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />

      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ translateY: logoY }] }]}>
        <Image
          source={require('../../src/logo-dark.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Outfit Oracle"
        />
      </Animated.View>

      <Animated.View style={[styles.bottom, { opacity: tagOpacity }]}>
        <Text style={styles.tagline}>
          Dress for the sky.{'\n'}Not the forecast.
        </Text>
        <View style={styles.rule} />
        <Text style={styles.sub}>
          Weather-powered outfit verdicts,{'\n'}editorially curated by AI.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.ctaWrap, { opacity: ctaOpacity }]}>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel="Enter the Oracle"
        >
          <Text style={styles.ctaText}>Enter the Oracle</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts, themeName: ThemeName) {
  const isY2K = isY2KTheme(themeName);

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bgDark,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: Platform.OS === 'ios' ? 48 : 32,
      paddingHorizontal: spacing.lg,
      justifyContent: 'space-between',
    },
    logoWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: '85%',
      height: height * 0.35,
    },
    bottom: {
      marginBottom: spacing.xl,
    },
    tagline: {
      fontFamily: fonts.display,
      fontSize: 36,
      color: '#FAF9F6',
      lineHeight: isY2K ? 50 : 42,
      letterSpacing: -0.5,
      marginBottom: spacing.lg,
    },
    rule: {
      height: 1,
      backgroundColor: 'rgba(250,249,246,0.15)',
      marginBottom: spacing.md,
    },
    sub: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: 'rgba(250,249,246,0.45)',
      letterSpacing: 0.5,
      lineHeight: 18,
    },
    ctaWrap: {
      marginTop: spacing.md,
    },
    cta: {
      backgroundColor: '#FAF9F6',
      paddingVertical: 18,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    ctaPressed: {
      opacity: 0.85,
    },
    ctaText: {
      fontFamily: fonts.serif,
      fontSize: 20,
      color: colors.bgDark,
      lineHeight: isY2K ? 30 : 24,
      letterSpacing: -0.2,
    },
    ctaArrow: {
      fontFamily: fonts.mono,
      fontSize: 16,
      color: colors.bgDark,
    },
  });
}
