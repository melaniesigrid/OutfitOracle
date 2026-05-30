import { formatLocationTime, formatLocationTimeWithCue, hasLocationOffset } from '../src/utils/locationTime';

const TIME_24H: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

describe('location time formatting', () => {
  it('formats timestamps in the weather location offset instead of the device timezone', () => {
    const timestamp = Date.UTC(2026, 0, 1, 4, 30);

    expect(formatLocationTime(timestamp, -5 * 3600, TIME_24H)).toBe('23:30');
    expect(formatLocationTime(timestamp, 9 * 3600, TIME_24H)).toBe('13:30');
  });

  it('adds a local cue only when a location offset is available', () => {
    const timestamp = Date.UTC(2026, 0, 1, 4, 30);

    expect(formatLocationTimeWithCue(timestamp, -5 * 3600, TIME_24H)).toBe('23:30 LOCAL');
    expect(formatLocationTimeWithCue(timestamp, undefined, TIME_24H)).not.toContain('LOCAL');
  });

  it('accepts zero as a valid UTC offset', () => {
    expect(hasLocationOffset(0)).toBe(true);
    expect(formatLocationTimeWithCue(Date.UTC(2026, 0, 1, 4, 30), 0, TIME_24H)).toBe('04:30 LOCAL');
  });
});
