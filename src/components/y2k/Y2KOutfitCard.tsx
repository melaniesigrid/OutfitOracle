import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { OutfitItem } from '../../services/oracle';
import { useAppData } from '../../contexts/AppContext';
import { y2kTokens, spacing } from '../../theme';
import { Y2KCard } from './Y2KCard';
import { Y2KBadge } from './Y2KBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { getY2KTypography, Y2KTypography } from '../../theme/y2kTypography';

const NONE_NEEDED_RE = /\bnone\b|not needed|no outer|skip the|universe has gifted|weather permits|too warm|unnecessary/i;

function splitItems(raw: string): string[] {
  return raw.split(/,\s*|\s+and\s+|\s*\+\s*/i).map(s => s.trim()).filter(Boolean);
}

function openShop(itemName: string) {
  const q = encodeURIComponent(itemName);
  Linking.openURL(`https://www.google.com/search?tbm=shop&q=${q}`);
}

interface Props {
  item: OutfitItem;
  index: number;
  city: string;
  vibe: string;
  weather?: { temp: number; conditionLabel: string };
}

const CATEGORY_ACCENTS: Record<string, string> = {
  top:            y2kTokens.hotPink,
  bottom:         y2kTokens.deepPurple,
  outer:          y2kTokens.mutedPurple,
  'outer layer':  y2kTokens.mutedPurple,
  footwear:       y2kTokens.lime,
  accessories:    y2kTokens.yellowHighlight,
};

function categoryColor(cat: string): string {
  return CATEGORY_ACCENTS[cat.toLowerCase()] ?? y2kTokens.hotPink;
}

export function Y2KOutfitCard({ item, index, city, vibe, weather }: Props) {
  const { savedCtx } = useAppData();
  const { y2kFontSubtheme } = useTheme();
  const typo   = useMemo(() => getY2KTypography(y2kFontSubtheme), [y2kFontSubtheme]);
  const styles = useMemo(() => makeStyles(typo), [typo]);

  const isNoneNeeded = NONE_NEEDED_RE.test(item.item);
  const shopItems    = splitItems(item.item);
  const hearted      = savedCtx.isSaved(item, city);
  const catColor     = categoryColor(item.category);
  const num          = String(index + 1).padStart(2, '0');

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hearted) {
      savedCtx.removeOutfit(item, city);
    } else {
      savedCtx.saveOutfit(item, city, vibe, weather);
    }
  };

  if (isNoneNeeded) return null;

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, styles.wrapper]}>
      <Y2KCard shadow style={styles.card}>
        <View style={styles.content}>

          {/* Piece number + category badge */}
          <View style={styles.headerRow}>
            <Text style={styles.pieceNum}>PIECE {num}</Text>
            <Y2KBadge
              label={item.category.toUpperCase()}
              variant={catColor === y2kTokens.hotPink ? 'hotpink' : catColor === y2kTokens.lime ? 'lime' : 'purple'}
              style={styles.catBadge}
            />
            <Pressable
              onPress={toggleSave}
              accessibilityRole="button"
              accessibilityLabel={hearted ? 'Remove from saved looks' : 'Save this look'}
              style={styles.heartBtn}
            >
              <Text style={[styles.heart, { color: hearted ? y2kTokens.hotPink : y2kTokens.mutedPurple }]}>
                {hearted ? '♥' : '♡'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.rule} />

          {/* Item name — uses display font (Baloo 2 or Syne per subtheme) */}
          <Text style={styles.itemName}>{item.item}</Text>

          {/* Detail — editorial italic (Cormorant in both subthemes, always legible) */}
          <Text style={styles.detail}>{item.detail}</Text>

          {shopItems.length > 0 && (
            <Pressable
              onPress={() => openShop(shopItems[0])}
              accessibilityRole="link"
              accessibilityLabel={`Shop ${shopItems[0]}`}
              style={styles.shopBtn}
            >
              <Text style={styles.shopText}>SHOP SIMILAR →</Text>
            </Pressable>
          )}
        </View>
      </Y2KCard>
    </Animated.View>
  );
}

function makeStyles(typo: Y2KTypography) { return StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  card: {},
  content: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pieceNum: {
    fontFamily: typo.monoMicro.fontFamily,
    fontSize: 9,
    letterSpacing: 2,
    color: y2kTokens.mutedPurple,
    flex: 1,
  },
  catBadge: {
    marginRight: 4,
  },
  heartBtn: {
    padding: 4,
  },
  heart: {
    fontSize: 18,
    fontFamily: typo.monoMicro.fontFamily,
  },
  rule: {
    height: 1,
    backgroundColor: y2kTokens.blush,
    marginBottom: spacing.sm,
  },
  itemName: {
    fontFamily: typo.displaySmall.fontFamily,
    fontSize: 20,
    color: y2kTokens.ink,
    lineHeight: 26,
    letterSpacing: typo.displaySmall.letterSpacing,
    marginBottom: 6,
  },
  detail: {
    fontFamily: typo.editorialSmall.fontFamily,
    fontSize: 15,
    color: y2kTokens.mutedPurple,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  shopBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  shopText: {
    fontFamily: typo.monoLabel.fontFamily,
    fontSize: 9,
    letterSpacing: 2,
    color: y2kTokens.hotPink,
  },
}); }
