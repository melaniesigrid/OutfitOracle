import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { OutfitItem } from '../services/oracle';
import { useAppData } from '../contexts/AppContext';
import { AppColors, AppFonts, AppMetrics, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

const NONE_NEEDED_RE = /\bnone\b|not needed|no outer|skip the|universe has gifted|weather permits|too warm|unnecessary/i;

interface Props {
  item: OutfitItem;
  index: number;
  city: string;
  vibe: string;
  weather?: { temp: number; conditionLabel: string };
}

function openShop(itemName: string) {
  const q = encodeURIComponent(itemName);
  Linking.openURL(`https://www.google.com/search?tbm=shop&q=${q}`);
}

// Split "scarf, gloves and sunglasses" or "clutch + earrings + scarf" into individual items
function splitItems(raw: string): string[] {
  return raw
    .split(/,\s*|\s+and\s+|\s*\+\s*/i)
    .map(s => s.trim())
    .filter(Boolean);
}

export function OutfitCard({ item, index, city, vibe, weather }: Props) {
  const { colors, fonts, metrics, flags } = useTheme();
  const { savedCtx } = useAppData();

  const accentMap = useMemo(() => ({
    mint:     { color: colors.mint, text: colors.mintText },
    lavender: { color: colors.lavender, text: colors.lavenderText },
    coral:    { color: colors.coral, text: colors.coralText },
    lemon:    { color: colors.lemon, text: colors.lemonText },
    iris:     { color: colors.iris, text: colors.irisText },
  }), [colors]);

  const accent = accentMap[item.accentColor as keyof typeof accentMap] ?? accentMap.mint;
  const styles = useMemo(() => makeStyles(colors, fonts, metrics, flags, accent), [colors, fonts, metrics, flags, accent]);

  const num = String(index + 1).padStart(2, '0');
  const isNoneNeeded = NONE_NEEDED_RE.test(item.item);
  const shopItems = splitItems(item.item);
  const hearted = savedCtx.isSaved(item, city);

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 420, delay: index * 90, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 420, delay: index * 90, useNativeDriver: true }),
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

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.rule} />
      <View style={styles.inner}>
        <Text style={styles.num}>{num}</Text>
        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <Text style={[styles.category, { color: accent.color }]}>
              {item.category.toUpperCase()}
            </Text>
            <Pressable
              onPress={toggleSave}
              accessibilityRole="button"
              accessibilityLabel={hearted ? `Remove ${item.item} from saved looks` : `Save ${item.item}`}
              hitSlop={12}
            >
              <MaterialCommunityIcons
                name={hearted ? 'heart' : 'heart-outline'}
                size={16}
                color={hearted ? colors.scarletFg : colors.border}
              />
            </Pressable>
          </View>
          <Text style={styles.itemName}>{item.item}</Text>
          <Text style={styles.detail}>{item.detail}</Text>

          {isNoneNeeded ? (
            <Text style={styles.blessingNote}>
              The Oracle blesses your bare arms. Go forth. :)
            </Text>
          ) : (
            <View style={styles.shopBtns}>
              {shopItems.map(piece => (
                <Pressable
                  key={piece}
                  style={({ pressed }) => [styles.shopBtn, pressed && styles.shopBtnPressed]}
                  onPress={() => openShop(piece)}
                  accessibilityRole="link"
                  accessibilityLabel={`Shop ${piece}`}
                  accessibilityHint="Opens Google Shopping in your browser"
                >
                  <Text style={[styles.shopText, { color: flags.solidCardBackgrounds ? accent.text : accent.color }]}>
                    {shopItems.length > 1 ? `SHOP ${piece.toUpperCase()}` : 'SHOP THIS PIECE'}
                  </Text>
                  <MaterialCommunityIcons
                    name="open-in-new"
                    size={10}
                    color={flags.solidCardBackgrounds ? accent.text : accent.color}
                    style={styles.shopIcon}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts, metrics: AppMetrics, flags: any, accent: any) {
  const isSolid = flags.solidCardBackgrounds;
  const cardBg = isSolid ? accent.color : colors.bgCard;
  const textColor = isSolid ? accent.text : colors.textPrimary;
  const textMuted = isSolid ? accent.text : colors.textSecondary;

  return StyleSheet.create({
    card: {
      marginBottom: metrics.cardGap === 32 ? spacing.xl : spacing.lg,
      ...(metrics.borderWidth > 1 ? {
        backgroundColor: cardBg,
        borderWidth: metrics.borderWidth,
        borderColor: colors.borderHard,
        padding: spacing.md,
        borderRadius: metrics.radius,
      } : {}),
      ...(metrics.shadowOpacity > 0 ? {
        shadowColor: metrics.shadowColor,
        shadowOffset: { width: metrics.shadowOffset, height: metrics.shadowOffset },
        shadowOpacity: metrics.shadowOpacity,
        shadowRadius: 0,
      } : {}),
    },
    rule: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
      display: metrics.borderWidth >= 3 ? 'none' : 'flex',
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    num: {
      fontFamily: fonts.displayLight,
      fontSize: 52,
      color: textColor,
      opacity: isSolid ? 0.25 : 0.10,
      lineHeight: 54,
      width: 52,
      textAlign: 'right',
    },
    content: {
      flex: 1,
      paddingTop: 4,
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    category: {
      fontFamily: fonts.mono,
      fontSize: 12,
      letterSpacing: 2.5,
    },
    itemName: {
      fontFamily: fonts.display,
      fontSize: 22,
      color: textColor,
      lineHeight: 26,
      marginBottom: spacing.xs,
      letterSpacing: -0.3,
    },
    detail: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: textMuted,
      lineHeight: 17,
      marginBottom: spacing.sm,
    },
    shopBtns: {
      gap: 6,
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
      fontSize: 12,
      letterSpacing: 2,
    },
    shopIcon: {
      marginTop: 1,
    },
    blessingNote: {
      fontFamily: fonts.mono,
      fontSize: 12,
      color: isSolid ? textColor : colors.textMuted,
      fontStyle: 'italic',
      letterSpacing: 0.2,
      opacity: isSolid ? 0.7 : 1,
    },
  });
}
