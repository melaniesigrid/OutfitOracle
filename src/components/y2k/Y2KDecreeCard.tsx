import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { OracleVerdict } from '../../services/oracle';
import { y2kTokens, spacing } from '../../theme';
import { Y2KCard } from './Y2KCard';
import { Y2KSignature } from './Y2KSignature';
import { Y2KSticker } from './Y2KSticker';
import { useTheme } from '../../contexts/ThemeContext';
import { getY2KTypography, Y2KTypography } from '../../theme/y2kTypography';

interface Props {
  verdict: OracleVerdict;
}

function pickSignature(vibe: string): string {
  const v = vibe.toLowerCase();
  if (/rain|storm|drizzle|wet/.test(v)) return 'weather said no';
  if (/apoc|chaos|fierce|savage|dramatic/.test(v)) return 'signed, unfortunately';
  if (/chic|elegant|luxe|glam/.test(v)) return 'the oracle has spoken ♡';
  if (/cozy|comfort|casual|soft/.test(v)) return 'approved with conditions';
  return 'xoxo, the oracle ♡';
}

export function Y2KDecreeCard({ verdict }: Props) {
  const { y2kFontSubtheme } = useTheme();
  const typo   = useMemo(() => getY2KTypography(y2kFontSubtheme), [y2kFontSubtheme]);
  const styles = useMemo(() => makeStyles(typo), [typo]);

  const filled     = verdict.rating;
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: spacing.lg }}>
      <Y2KCard>
        <View style={styles.content}>

          {/* Decorative stickers */}
          <View style={styles.stickerRow}>
            <Y2KSticker type="sparkle" size={13} color={y2kTokens.hotPink} />
            <Y2KSticker type="filledHeart" size={13} color={y2kTokens.hotPink} />
            <Y2KSticker type="sparkle" size={11} color={y2kTokens.mutedPurple} />
          </View>

          {/* File header */}
          <View style={styles.fileHeader}>
            <Text style={styles.fileLabel}>// THE DECREE</Text>
            <Text style={styles.fileRight}>FOR THE RECORD ♡</Text>
          </View>
          <View style={styles.rule} />

          {/* Vibe — lowercase for impact */}
          <Text style={styles.vibeHeadline}>{verdict.vibe.toLowerCase()}</Text>

          {/* Verdict pull quote */}
          <Text style={styles.verdictText}>"{verdict.verdict}"</Text>

          <View style={styles.rule} />

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>EFFORT</Text>
            <View style={styles.ratingBar}>
              {Array.from({ length: 5 }, (_, i) => (
                <View
                  key={i}
                  style={[styles.pip, i < filled ? styles.pipFilled : styles.pipEmpty]}
                />
              ))}
            </View>
            <Text style={styles.ratingNum}>{filled} / 5</Text>
          </View>

          <View style={styles.dividerLight} />

          <Y2KSignature
            text={pickSignature(verdict.vibe)}
            color={y2kTokens.mutedPurple}
            style={styles.signature}
          />
        </View>
      </Y2KCard>
    </Animated.View>
  );
}

function makeStyles(typo: Y2KTypography) { return StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  stickerRow: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: 4,
    zIndex: 1,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fileLabel: {
    fontFamily: typo.monoLabel.fontFamily,
    fontSize: 12,
    letterSpacing: 2,
    color: y2kTokens.mutedPurple,
  },
  fileRight: {
    fontFamily: typo.monoData.fontFamily,
    fontSize: 12,
    letterSpacing: 1.5,
    color: y2kTokens.hotPink,
  },
  rule: {
    height: 1,
    backgroundColor: y2kTokens.deepPurple,
    marginVertical: spacing.md,
  },
  vibeHeadline: {
    fontFamily: typo.displayLarge.fontFamily,
    fontSize: 44,
    color: y2kTokens.hotPink,
    letterSpacing: typo.displayLarge.letterSpacing,
    marginBottom: spacing.md,
  },
  verdictText: {
    fontFamily: typo.editorialItalic.fontFamily,
    fontSize: 21,
    color: y2kTokens.ink,
    lineHeight: 32,
    letterSpacing: 0.2,
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingLabel: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 11,
    letterSpacing: 2,
    color: y2kTokens.mutedPurple,
  },
  ratingBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  pip: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  pipFilled: {
    backgroundColor: y2kTokens.hotPink,
  },
  pipEmpty: {
    backgroundColor: y2kTokens.blush,
    borderWidth: 1,
    borderColor: y2kTokens.hotPink,
  },
  ratingNum: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 11,
    color: y2kTokens.mutedPurple,
    letterSpacing: 1,
  },
  dividerLight: {
    height: 1,
    backgroundColor: y2kTokens.blush,
    marginVertical: spacing.md,
  },
  signature: {
    textAlign: 'right',
    fontSize: 20,
  },
}); }
