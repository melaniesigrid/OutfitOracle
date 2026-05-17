import { getSeason } from '../src/services/oracle';

describe('getSeason', () => {
  describe('northern hemisphere (lat >= 0, default)', () => {
    it('month 2 → Spring', () => expect(getSeason(2)).toBe('Spring'));
    it('month 3 → Spring', () => expect(getSeason(3)).toBe('Spring'));
    it('month 4 → Spring', () => expect(getSeason(4)).toBe('Spring'));
    it('month 5 → Summer', () => expect(getSeason(5)).toBe('Summer'));
    it('month 6 → Summer', () => expect(getSeason(6)).toBe('Summer'));
    it('month 7 → Summer', () => expect(getSeason(7)).toBe('Summer'));
    it('month 8 → Autumn', () => expect(getSeason(8)).toBe('Autumn'));
    it('month 9 → Autumn', () => expect(getSeason(9)).toBe('Autumn'));
    it('month 10 → Autumn', () => expect(getSeason(10)).toBe('Autumn'));
    it('month 11 → Winter', () => expect(getSeason(11)).toBe('Winter'));
    it('month 0 → Winter', () => expect(getSeason(0)).toBe('Winter'));
    it('month 1 → Winter', () => expect(getSeason(1)).toBe('Winter'));
  });

  describe('northern hemisphere (explicit positive lat)', () => {
    it('July in NYC (lat 40.7) → Summer', () => expect(getSeason(6, 40.7)).toBe('Summer'));
    it('December in London (lat 51.5) → Winter', () => expect(getSeason(11, 51.5)).toBe('Winter'));
    it('lat=0 treated as northern', () => expect(getSeason(6, 0)).toBe('Summer'));
  });

  describe('southern hemisphere (lat < 0) — 6-month flip', () => {
    it('month 6 (July) in Sydney (lat -33) → Winter', () => expect(getSeason(6, -33)).toBe('Winter'));
    it('month 0 (January) in Buenos Aires (lat -34) → Summer', () => expect(getSeason(0, -34)).toBe('Summer'));
    it('month 3 (April) in Cape Town (lat -33) → Autumn', () => expect(getSeason(3, -33)).toBe('Autumn'));
    it('month 9 (October) in Wellington (lat -41) → Spring', () => expect(getSeason(9, -41)).toBe('Spring'));
  });

  describe('null/undefined lat defaults to northern', () => {
    it('undefined lat defaults to 45 (northern)', () => expect(getSeason(6, undefined)).toBe('Summer'));
  });
});
