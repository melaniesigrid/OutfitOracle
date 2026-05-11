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

export interface StyleProfile {
  keywords: string[];
  budget: BudgetTier;
  name?: string;
  personality?: OraclePersonality;
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
    });
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
