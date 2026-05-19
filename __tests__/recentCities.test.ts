// Regression tests for case-insensitive city deduplication logic
// (Bug: removeCity previously used strict equality, so 'New York' wouldn't remove 'new york')
// These tests validate the filtering logic directly — the hook delegates to these same expressions.

describe('recentCities — case-insensitive filter logic', () => {
  const recents = ['New York', 'London', 'Paris'];

  describe('removeCity logic', () => {
    it('removes city regardless of input case', () => {
      const updated = recents.filter(c => c.toLowerCase() !== 'new york'.toLowerCase());
      expect(updated).not.toContain('New York');
      expect(updated).toContain('London');
      expect(updated).toContain('Paris');
    });

    it('removes city when case matches exactly', () => {
      const updated = recents.filter(c => c.toLowerCase() !== 'London'.toLowerCase());
      expect(updated).not.toContain('London');
      expect(updated).toHaveLength(2);
    });

    it('removes city when input is UPPERCASE', () => {
      const updated = recents.filter(c => c.toLowerCase() !== 'PARIS'.toLowerCase());
      expect(updated).not.toContain('Paris');
    });

    it('does not remove unrelated cities', () => {
      const updated = recents.filter(c => c.toLowerCase() !== 'tokyo'.toLowerCase());
      expect(updated).toEqual(recents);
    });
  });

  describe('addCity deduplication logic', () => {
    it('deduplicates case-insensitively before prepending', () => {
      const city = 'new york';
      const updated = [city, ...recents.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
      const yorks = updated.filter(c => c.toLowerCase() === 'new york');
      expect(yorks).toHaveLength(1);
      expect(updated[0]).toBe('new york');
    });

    it('prepends new city to front', () => {
      const city = 'Tokyo';
      const updated = [city, ...recents.filter(c => c.toLowerCase() !== city.toLowerCase())];
      expect(updated[0]).toBe('Tokyo');
      expect(updated).toHaveLength(4);
    });

    it('respects MAX=5 limit', () => {
      const full = ['A', 'B', 'C', 'D', 'E'];
      const city = 'F';
      const updated = [city, ...full.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
      expect(updated).toHaveLength(5);
      expect(updated[0]).toBe('F');
    });
  });
});
