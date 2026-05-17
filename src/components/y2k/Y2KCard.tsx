import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { y2kTokens } from '../../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  shadow?: boolean;
}

/**
 * Cream card with double border (outer 1.5px ink → 4px cream gap → inner 1px ink)
 * and a deep-purple offset shadow. The Y2K base card.
 */
export function Y2KCard({ children, style, innerStyle, shadow = true }: Props) {
  return (
    <View style={[styles.outer, shadow && styles.shadow, style]}>
      <View style={[styles.inner, innerStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: y2kTokens.borderWidth,
    borderColor: y2kTokens.ink,
    borderRadius: y2kTokens.radius,
    padding: 4,
    backgroundColor: y2kTokens.cream,
  },
  shadow: {
    shadowColor: y2kTokens.deepPurple,
    shadowOffset: { width: y2kTokens.shadowOffset, height: y2kTokens.shadowOffset },
    shadowOpacity: 0.40,
    shadowRadius: 0,
    elevation: 5,
  },
  inner: {
    borderWidth: 1,
    borderColor: y2kTokens.ink,
    borderRadius: y2kTokens.radiusSm,
    backgroundColor: y2kTokens.cream,
    overflow: 'hidden',
  },
});
