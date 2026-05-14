import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { y2kTokens } from '../../theme';

export type StickerType = 'heart' | 'filledHeart' | 'sparkle' | 'star' | 'dot' | 'glitter' | 'cross' | 'diamond';

const GLYPH: Record<StickerType, string> = {
  heart:       '♡',
  filledHeart: '♥',
  sparkle:     '✦',
  star:        '★',
  dot:         '·',
  glitter:     '✧',
  cross:       '✕',
  diamond:     '◆',
};

interface Props {
  type?: StickerType;
  size?: number;
  color?: string;
  rotate?: number;
  style?: ViewStyle | TextStyle;
}

export function Y2KSticker({
  type = 'heart',
  size = 16,
  color = y2kTokens.hotPink,
  rotate = 0,
  style,
}: Props) {
  return (
    <Text
      style={[
        styles.base,
        { fontSize: size, color },
        rotate !== 0 && { transform: [{ rotate: `${rotate}deg` }] },
        style as TextStyle,
      ]}
    >
      {GLYPH[type]}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'IBMPlexMono_400Regular',
    lineHeight: undefined,
  },
});
