import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { OracleStatus } from '../hooks/useOracle';
import { colors, fonts, spacing } from '../theme';

const WEATHER_MESSAGES = [
  'Consulting the atmospheric archives…',
  'Reading the sky with a trained eye…',
  'Interrogating the barometric pressure…',
  'The atmosphere has opinions. We are collecting them.',
  'Checking conditions — patience is a virtue.',
];

const VERDICT_MESSAGES = [
  'The Oracle is passing judgement…',
  'Assembling your editorial brief…',
  'Considering every possibility. Rejecting most of them.',
  'Channelling sartorial wisdom from the ages…',
  'The Oracle deliberates. Fashion waits for no one.',
  'Curating with intention. This takes a moment.',
  'Composing the verdict. Brutally, but lovingly.',
];

interface Props {
  status: OracleStatus;
}

export function LoadingOracle({ status }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [msgIndex, setMsgIndex] = useState(0);

  const isActive = status === 'fetching-weather' || status === 'fetching-verdict';
  const messages = status === 'fetching-weather' ? WEATHER_MESSAGES : VERDICT_MESSAGES;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.12, duration: 1400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,    duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [status]);

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, { opacity }]}>{messages[msgIndex]}</Animated.Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  text: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  track: {
    width: 100,
    height: 1,
    backgroundColor: colors.border,
  },
  fill: {
    width: '55%',
    height: '100%',
    backgroundColor: colors.textPrimary,
  },
});
