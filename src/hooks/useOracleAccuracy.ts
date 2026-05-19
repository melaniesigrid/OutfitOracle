import { useMemo } from 'react';
import { HistoryEntry } from './useOutfitHistory';

export interface OracleAccuracy {
  accuracy: number;        // 0–100 percentage
  ratedCount: number;
  positiveCount: number;   // ratings >= 4
  isTrusted: boolean;      // >= 80% accuracy on >= 10 ratings
}

export function useOracleAccuracy(history: HistoryEntry[]): OracleAccuracy {
  return useMemo(() => {
    const rated = history.filter(e => e.userRating != null);
    const ratedCount = rated.length;
    if (ratedCount === 0) {
      return { accuracy: 0, ratedCount: 0, positiveCount: 0, isTrusted: false };
    }
    const positiveCount = rated.filter(e => (e.userRating ?? 0) >= 4).length;
    const accuracy = Math.round((positiveCount / ratedCount) * 100);
    const isTrusted = ratedCount >= 10 && accuracy >= 80;
    return { accuracy, ratedCount, positiveCount, isTrusted };
  }, [history]);
}
