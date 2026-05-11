import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OutfitItem } from '../services/oracle';
import { colors, fonts, spacing } from '../theme';

const accentMap = {
  mint:     { color: colors.mint },
  lavender: { color: colors.lavender },
  coral:    { color: colors.coral },
  lemon:    { color: colors.lemon },
  iris:     { color: colors.iris },
};

const NONE_NEEDED_RE = /\bnone\b|not needed|no outer|skip the|universe has gifted|weather permits|too warm|unnecessary/i;

interface Props {
  item: OutfitItem;
  index: number;
}

function openShop(itemName: string) {
  const q = encodeURIComponent(itemName);
  Linking.openURL(`https://www.google.com/search?tbm=shop&q=${q}`);
}

export function OutfitCard({ item, index }: Props) {
  const accent = accentMap[item.accentColor] ?? accentMap.mint;
  const num = String(index + 1).padStart(2, '0');
  const isNoneNeeded = NONE_NEEDED_RE.test(item.item);

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 420, delay: index * 90, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 420, delay: index * 90, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.rule} />
      <View style={styles.inner}>
        <Text style={styles.num}>{num}</Text>
        <View style={styles.content}>
          <Text style={[styles.category, { color: accent.color }]}>
            {item.category.toUpperCase()}
          </Text>
          <Text style={styles.itemName}>{item.item}</Text>
          <Text style={styles.detail}>{item.detail}</Text>

          {isNoneNeeded ? (
            <Text style={styles.blessingNote}>
              The Oracle blesses your bare arms. Go forth. :)
            </Text>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.shopBtn, pressed && styles.shopBtnPressed]}
              onPress={() => openShop(item.item)}
              accessibilityRole="link"
              accessibilityLabel={`Shop ${item.item}`}
              accessibilityHint="Opens Google Shopping in your browser"
            >
              <Text style={[styles.shopText, { color: accent.color }]}>SHOP THIS PIECE</Text>
              <MaterialCommunityIcons
                name="open-in-new"
                size={10}
                color={accent.color}
                style={styles.shopIcon}
              />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  num: {
    fontFamily: fonts.displayLight,
    fontSize: 52,
    color: colors.textPrimary,
    opacity: 0.10,
    lineHeight: 54,
    width: 52,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
  category: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  itemName: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  detail: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    gap: 4,
  },
  shopBtnPressed: {
    opacity: 0.6,
  },
  shopText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  shopIcon: {
    marginTop: 1,
  },
  blessingNote: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});
