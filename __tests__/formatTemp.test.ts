/**
 * formatTemp.test.ts
 *
 * Tests the Celsius→Fahrenheit conversion formula used in TemperatureContext.tsx.
 * The context wraps this in a useCallback bound to `unit` state; the conversion
 * math is extracted here as a pure function for isolated coverage.
 */

function formatTemp(celsius: number, unit: 'C' | 'F'): string {
  if (unit === 'F') return String(Math.round(celsius * 9 / 5 + 32));
  return String(Math.round(celsius));
}

describe('formatTemp — Celsius mode', () => {
  it('returns the rounded value as a string', () => {
    expect(formatTemp(0, 'C')).toBe('0');
    expect(formatTemp(20, 'C')).toBe('20');
    expect(formatTemp(-10, 'C')).toBe('-10');
  });

  it('rounds fractional Celsius values', () => {
    expect(formatTemp(20.4, 'C')).toBe('20');
    expect(formatTemp(20.5, 'C')).toBe('21');
    expect(formatTemp(-0.5, 'C')).toBe('0');
  });

  it('handles extreme values', () => {
    expect(formatTemp(-40, 'C')).toBe('-40');
    expect(formatTemp(100, 'C')).toBe('100');
  });
});

describe('formatTemp — Fahrenheit mode', () => {
  it('converts known reference points correctly', () => {
    expect(formatTemp(0, 'F')).toBe('32');    // freezing
    expect(formatTemp(100, 'F')).toBe('212'); // boiling
    expect(formatTemp(-40, 'F')).toBe('-40'); // converge point
  });

  it('converts typical weather temperatures', () => {
    expect(formatTemp(20, 'F')).toBe('68');
    expect(formatTemp(37, 'F')).toBe('99');   // ~body temp
    expect(formatTemp(-10, 'F')).toBe('14');
    expect(formatTemp(35, 'F')).toBe('95');
  });

  it('rounds to nearest integer', () => {
    // 1°C → 33.8°F → rounds to 34
    expect(formatTemp(1, 'F')).toBe('34');
    // -1°C → 30.2°F → rounds to 30
    expect(formatTemp(-1, 'F')).toBe('30');
  });

  it('returns a string not a number', () => {
    const result = formatTemp(25, 'F');
    expect(typeof result).toBe('string');
    expect(result).toBe('77');
  });
});

describe('formatTemp — edge cases', () => {
  it('handles zero correctly in both units', () => {
    expect(formatTemp(0, 'C')).toBe('0');
    expect(formatTemp(0, 'F')).toBe('32');
  });

  it('produces identical results at the -40 convergence point', () => {
    const c = formatTemp(-40, 'C');
    const f = formatTemp(-40, 'F');
    expect(c).toBe(f); // -40°C === -40°F
    expect(c).toBe('-40');
  });
});
