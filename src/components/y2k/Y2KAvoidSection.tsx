import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { y2kTokens, spacing } from '../../theme';
import { Y2KCard } from './Y2KCard';

interface Props {
  items: string[];
}

export function Y2KAvoidSection({ items }: Props) {
  if (!items?.length) return null;
  return (
    <View style={styles.wrapper}>
      <Y2KCard shadow style={styles.card} innerStyle={{ backgroundColor: y2kTokens.blush }}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.stamp}>✕ ORACLE FORBIDS ✕</Text>
            <Text style={styles.sub}>// DO NOT WEAR</Text>
          </View>
          <View style={styles.rule} />
          {items.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.bullet}>✕</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      </Y2KCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  card: {},
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stamp: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 12,
    letterSpacing: 2,
    color: y2kTokens.hotPink,
  },
  sub: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.5,
    color: y2kTokens.mutedPurple,
  },
  rule: {
    height: 1,
    backgroundColor: y2kTokens.hotPink,
    marginVertical: spacing.sm,
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 6,
  },
  bullet: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: y2kTokens.hotPink,
    marginTop: 2,
  },
  itemText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: y2kTokens.ink,
    lineHeight: 20,
    flex: 1,
  },
});
