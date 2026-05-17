import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { y2kTokens } from '../../theme';

type Variant = 'hotpink' | 'lime' | 'cream' | 'purple';

interface Props {
  label: string;
  variant?: Variant;
  style?: ViewStyle;
  rotate?: number;
}

const VARIANT_STYLES: Record<Variant, { bg: string; text: string; border: string }> = {
  hotpink: { bg: y2kTokens.hotPink,    text: y2kTokens.cream,      border: y2kTokens.ink },
  lime:    { bg: y2kTokens.lime,       text: y2kTokens.ink,        border: y2kTokens.ink },
  cream:   { bg: y2kTokens.cream,      text: y2kTokens.deepPurple, border: y2kTokens.deepPurple },
  purple:  { bg: y2kTokens.deepPurple, text: y2kTokens.cream,      border: y2kTokens.ink },
};

export function Y2KBadge({ label, variant = 'hotpink', style, rotate = 0 }: Props) {
  const v = VARIANT_STYLES[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: v.bg, borderColor: v.border },
        rotate !== 0 && { transform: [{ rotate: `${rotate}deg` }] },
        style,
      ]}
    >
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
