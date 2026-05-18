import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { AppColors, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

function useShimmer() {
  const opacity = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.72, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return opacity;
}

type Styles = ReturnType<typeof makeStyles>;

function Box({
  w, h, opacity, borderColor, style,
}: {
  w: number | string; h: number; opacity: Animated.Value; borderColor: string; style?: object;
}) {
  return (
    <Animated.View
      style={[{ width: w, height: h, backgroundColor: borderColor }, style, { opacity }]}
    />
  );
}

function SkeletonWeatherStrip({ opacity, styles, borderColor }: { opacity: Animated.Value; styles: Styles; borderColor: string }) {
  return (
    <View style={styles.weatherContainer}>
      <View style={styles.hardRule} />
      <View style={styles.locationRow}>
        <View>
          <Box w={170} h={22} opacity={opacity} borderColor={borderColor} />
          <Box w={90} h={10} opacity={opacity} borderColor={borderColor} style={{ marginTop: 8 }} />
        </View>
        <Box w={36} h={36} opacity={opacity} borderColor={borderColor} />
      </View>
      <View style={styles.hardRule} />
      <View style={styles.statsRow}>
        {[0, 1, 2].map(i => (
          <React.Fragment key={i}>
            {i > 0 && <View style={styles.statDivider} />}
            <View style={styles.statCell}>
              <Box w={48} h={10} opacity={opacity} borderColor={borderColor} />
              <Box w={44} h={22} opacity={opacity} borderColor={borderColor} style={{ marginTop: 6 }} />
              <Box w={44} h={10} opacity={opacity} borderColor={borderColor} style={{ marginTop: 4 }} />
            </View>
          </React.Fragment>
        ))}
      </View>
      <View style={styles.hardRule} />
    </View>
  );
}

function SkeletonVerdictCard({ opacity, styles, borderColor }: { opacity: Animated.Value; styles: Styles; borderColor: string }) {
  return (
    <View style={styles.verdictContainer}>
      <View style={styles.eyebrow}>
        <View style={styles.softRule} />
        <Box w={130} h={10} opacity={opacity} borderColor={borderColor} />
        <View style={styles.softRule} />
      </View>
      <Box w="95%" h={18} opacity={opacity} borderColor={borderColor} style={{ marginBottom: 8 }} />
      <Box w="82%" h={18} opacity={opacity} borderColor={borderColor} style={{ marginBottom: 8 }} />
      <Box w="62%" h={18} opacity={opacity} borderColor={borderColor} style={{ marginBottom: spacing.lg }} />
      <View style={styles.softRuleStandalone} />
      <View style={styles.metaRow}>
        <View>
          <Box w={80} h={10} opacity={opacity} borderColor={borderColor} style={{ marginBottom: 8 }} />
          <Box w={130} h={18} opacity={opacity} borderColor={borderColor} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Box w={52} h={10} opacity={opacity} borderColor={borderColor} style={{ marginBottom: 10 }} />
          <View style={styles.ratingRow}>
            {[0, 1, 2, 3, 4].map(i => (
              <Box key={i} w={18} h={3} opacity={opacity} borderColor={borderColor} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function SkeletonOutfitCard({ opacity, styles, borderColor }: { opacity: Animated.Value; styles: Styles; borderColor: string }) {
  return (
    <View style={styles.outfitCard}>
      <View style={styles.softRuleStandalone} />
      <View style={styles.outfitRow}>
        <Box w={52} h={44} opacity={opacity} borderColor={borderColor} style={{ opacity: 0.08 } as any} />
        <View style={styles.outfitContent}>
          <Box w={60} h={10} opacity={opacity} borderColor={borderColor} />
          <Box w={150} h={18} opacity={opacity} borderColor={borderColor} style={{ marginTop: 6 }} />
          <Box w={190} h={11} opacity={opacity} borderColor={borderColor} style={{ marginTop: 5 }} />
          <Box w={100} h={10} opacity={opacity} borderColor={borderColor} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonResults() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const opacity = useShimmer();
  return (
    <View style={styles.root}>
      <SkeletonWeatherStrip opacity={opacity} styles={styles} borderColor={colors.border} />
      <SkeletonVerdictCard opacity={opacity} styles={styles} borderColor={colors.border} />
      <SkeletonOutfitCard opacity={opacity} styles={styles} borderColor={colors.border} />
      <SkeletonOutfitCard opacity={opacity} styles={styles} borderColor={colors.border} />
      <SkeletonOutfitCard opacity={opacity} styles={styles} borderColor={colors.border} />
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    root: {
      marginTop: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    hardRule: {
      height: 1,
      backgroundColor: colors.border,
    },
    softRule: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    softRuleStandalone: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
    },
    weatherContainer: {
      marginBottom: spacing.xl,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    statCell: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      height: 44,
      backgroundColor: colors.border,
    },
    verdictContainer: {
      marginBottom: spacing.xl,
    },
    eyebrow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    ratingRow: {
      flexDirection: 'row',
      gap: 4,
    },
    outfitCard: {
      marginBottom: spacing.lg,
    },
    outfitRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    outfitContent: {
      flex: 1,
      paddingTop: 4,
    },
  });
}
