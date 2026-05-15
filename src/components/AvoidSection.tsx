import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  items: string[];
}

export function AvoidSection({ items }: Props) {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, delay: 480, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.header}>
        <View style={styles.scarletBar} />
        <Text style={styles.label}>THE ORACLE FORBIDS</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.bullet}>x</Text>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      ))}
      <View style={styles.rule} />
    </Animated.View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    scarletBar: {
      width: 3,
      height: 16,
      backgroundColor: colors.scarlet,
    },
    label: {
      fontFamily: fonts.mono,
      fontSize: 12,
      letterSpacing: 2.5,
      color: colors.scarlet,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bullet: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: colors.scarlet,
      lineHeight: 22,
    },
    itemText: {
      fontFamily: fonts.serif,
      fontSize: 16,
      color: colors.textPrimary,
      flex: 1,
      lineHeight: 22,
    },
    rule: {
      height: 1,
      backgroundColor: colors.border,
    },
  });
}
