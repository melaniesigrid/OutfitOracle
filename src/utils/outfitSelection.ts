import type { OracleVerdict, OutfitItem } from '../services/oracle';

export type LookMode = 'polished' | 'casual';

export function hasNightOutfit(verdict: OracleVerdict | null | undefined): boolean {
  return (verdict?.outfitsAlt?.length ?? 0) > 0;
}

export function selectOutfitsForLook(
  verdict: OracleVerdict | null | undefined,
  lookMode: LookMode,
): OutfitItem[] {
  if (!verdict) return [];
  if (lookMode === 'casual' && hasNightOutfit(verdict)) {
    return verdict.outfitsAlt ?? [];
  }
  return verdict.outfits ?? [];
}
