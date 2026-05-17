import React, { useMemo } from 'react';
import { Text, TextStyle } from 'react-native';
import { y2kTokens } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { getY2KTypography } from '../../theme/y2kTypography';

interface Props {
  text?: string;
  color?: string;
  style?: TextStyle;
}

const DEFAULTS = [
  'xoxo, the oracle ♡',
  'signed, unfortunately',
  'approved with conditions',
  'weather said no',
  'the oracle has spoken ♡',
];

export function Y2KSignature({ text, color = y2kTokens.mutedPurple, style }: Props) {
  const { y2kFontSubtheme } = useTheme();
  const typo = useMemo(() => getY2KTypography(y2kFontSubtheme), [y2kFontSubtheme]);

  return (
    <Text style={[{ fontFamily: typo.scriptMedium.fontFamily, fontSize: 22, letterSpacing: 0.3, color }, style]}>
      {text ?? DEFAULTS[0]}
    </Text>
  );
}
