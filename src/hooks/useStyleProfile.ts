import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@outfit_oracle_style_profile';

export const STYLE_KEYWORDS = [
  'Minimal', 'Maximalist', 'Streetwear', 'Classic',
  'Eclectic', 'Coastal', 'Dark Academic', 'Y2K',
  'Quiet Luxury', 'Cottagecore', 'Athleisure', 'Business Casual',
] as const;

export const BUDGET_TIERS = [
  { id: 'high-street',   label: 'High Street',   note: 'ASOS, Zara, & Other Stories' },
  { id: 'contemporary', label: 'Contemporary',   note: 'Reiss, AllSaints, COS' },
  { id: 'luxury',       label: 'Luxury',         note: 'Totême, Bottega, The Row' },
] as const;

export type BudgetTier = typeof BUDGET_TIERS[number]['id'];

export type OraclePersonality = 'diplomatic' | 'editorial' | 'savage';

export const PERSONALITY_OPTIONS: Array<{
  id: OraclePersonality;
  title: string;
  desc: string;
  quote: string;
}> = [
  {
    id: 'diplomatic',
    title: 'The Diplomat',
    desc: 'Measured, clear, and informative. Style advice without strong opinions.',
    quote: '"I advise with grace."',
  },
  {
    id: 'editorial',
    title: 'The Editor',
    desc: 'Opinionated, direct, and editorial. Expect verdicts, not suggestions.',
    quote: '"Fashion waits for no one."',
  },
  {
    id: 'savage',
    title: 'The Savage Oracle',
    desc: 'Ruthlessly honest. If the outfit is wrong, you will know.',
    quote: '"I do not soften truths."',
  },
];

export type TempSensitivity = 'runs-cold' | 'normal' | 'runs-hot';

export const TEMP_SENSITIVITY_OPTIONS: Array<{
  id: TempSensitivity;
  label: string;
  note: string;
}> = [
  { id: 'runs-cold', label: 'Runs Cold',  note: 'Always chilly — I layer up' },
  { id: 'normal',    label: 'Normal',      note: 'Standard temperature comfort' },
  { id: 'runs-hot',  label: 'Runs Hot',    note: 'Always warm — I wear less' },
];

export const COLOR_OPTIONS = [
  { id: 'black',      label: 'Black',      hex: '#0D0B08' },
  { id: 'white',      label: 'White',      hex: '#FAFAF8' },
  { id: 'cream',      label: 'Cream',      hex: '#EDE8DC' },
  { id: 'grey',       label: 'Grey',       hex: '#8A8A8A' },
  { id: 'camel',      label: 'Camel',      hex: '#C19A6B' },
  { id: 'chocolate',  label: 'Chocolate',  hex: '#5C3317' },
  { id: 'navy',       label: 'Navy',       hex: '#1B2A4A' },
  { id: 'cobalt',     label: 'Cobalt',     hex: '#0047AB' },
  { id: 'burgundy',   label: 'Burgundy',   hex: '#800020' },
  { id: 'scarlet',    label: 'Scarlet',    hex: '#C41230' },
  { id: 'blush',      label: 'Blush',      hex: '#E8A0A0' },
  { id: 'mustard',    label: 'Mustard',    hex: '#C8963C' },
  { id: 'terracotta', label: 'Terracotta', hex: '#C06A45' },
  { id: 'emerald',    label: 'Emerald',    hex: '#1A6B2A' },
  { id: 'sage',       label: 'Sage',       hex: '#7D9B6A' },
  { id: 'lavender',   label: 'Lavender',   hex: '#9B8DB8' },
] as const;

export type ColorId = typeof COLOR_OPTIONS[number]['id'];

export interface StyleProfile {
  keywords: string[];
  budget: BudgetTier;
  name?: string;
  personality?: OraclePersonality;
  tempSensitivity?: TempSensitivity;
  colorLoves?: string[];
  colorAvoids?: string[];
}

type ProfileState =
  | { status: 'loading' }
  | { status: 'not-set' }
  | { status: 'skipped' }
  | { status: 'set'; profile: StyleProfile };

export function useStyleProfile() {
  const [state, setState] = useState<ProfileState>({ status: 'loading' });

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) { setState({ status: 'not-set' }); return; }
      try {
        const parsed = JSON.parse(raw);
        if (parsed.skipped) { setState({ status: 'skipped' }); return; }
        if (!parsed.keywords) { setState({ status: 'not-set' }); return; }
        setState({ status: 'set', profile: parsed as StyleProfile });
      } catch {
        setState({ status: 'not-set' });
      }
    }).catch(() => setState({ status: 'not-set' }));
  }, []);

  const saveProfile = (profile: StyleProfile) => {
    AsyncStorage.setItem(KEY, JSON.stringify(profile));
    setState({ status: 'set', profile });
  };

  const skip = () => {
    AsyncStorage.setItem(KEY, JSON.stringify({ skipped: true }));
    setState({ status: 'skipped' });
  };

  const edit = () => setState({ status: 'not-set' });

  const profile = state.status === 'set' ? state.profile : undefined;

  return { profileState: state, profile, saveProfile, skip, edit };
}
