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
  'Dispatching meteorological intelligence…',
  'The clouds are being cross-examined.',
  'Decoding the humidity. It tells all.',
  'Asking the wind what it intends.',
  'The sky is being assessed. Hold tight.',
  'Measuring the air. Fashion depends on it.',
  'Weather data incoming. The Oracle prepares.',
  'Consulting the barometric priesthood…',
  'The forecast is being coerced into clarity.',
  'Gathering atmospheric evidence…',
  'The dew point has a lot to say.',
  'Translating the sky into something useful.',
  'Checking if it will actually rain this time.',
  'The thermometer is being interviewed.',
  'Conditions noted. Judgement imminent.',
];

const VERDICT_MESSAGES = [
  'The Oracle is passing judgement…',
  'Assembling your editorial brief…',
  'Considering every possibility. Rejecting most of them.',
  'Channelling sartorial wisdom from the ages…',
  'The Oracle deliberates. Fashion waits for no one.',
  'Curating with intention. This takes a moment.',
  'Composing the verdict. Brutally, but lovingly.',
  'Consulting the annals of impeccable taste…',
  'The Oracle is having strong opinions about your weather.',
  'Filtering out the mediocre options. This is thorough work.',
  'Sartorial intelligence is being processed.',
  'The verdict is being drafted in the Oracle\'s preferred font.',
  'Your outfit is being assembled with ruthless precision.',
  'The Oracle consults its archives. Patience.',
  'Eliminating every wrong answer. Only perfection remains.',
  'The muse has arrived. The outfit follows.',
  'Reviewing this weather with the disdain it deserves.',
  'A considered verdict requires considered time.',
  'The Oracle never rushes. Excellence doesn\'t.',
  'Cross-referencing the forecast with the runway.',
  'Building your look from the ground up. Literally.',
  'Fashioning something appropriate from this weather.',
  'The Oracle has seen worse weather. It has thoughts.',
  'Your brief is being written with a sharp pen.',
  'Style advice in progress. Worth every second.',
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
