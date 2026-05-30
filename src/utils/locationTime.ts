const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

export function hasLocationOffset(utcOffsetSeconds: number | null | undefined): utcOffsetSeconds is number {
  return typeof utcOffsetSeconds === 'number' && Number.isFinite(utcOffsetSeconds);
}

function dateForLocation(timestamp: number, utcOffsetSeconds?: number | null): Date | null {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return hasLocationOffset(utcOffsetSeconds)
    ? new Date(timestamp + utcOffsetSeconds * 1000)
    : date;
}

function withLocationTimezone<T extends Intl.DateTimeFormatOptions>(
  options: T,
  utcOffsetSeconds?: number | null,
): T {
  return hasLocationOffset(utcOffsetSeconds)
    ? { ...options, timeZone: 'UTC' }
    : options;
}

export function formatLocationTime(
  timestamp: number | null | undefined,
  utcOffsetSeconds?: number | null,
  options: Intl.DateTimeFormatOptions = TIME_OPTIONS,
): string {
  if (timestamp == null) return '';
  const date = dateForLocation(timestamp, utcOffsetSeconds);
  if (!date) return '';
  return date.toLocaleTimeString([], withLocationTimezone(options, utcOffsetSeconds));
}

export function formatLocationDate(
  timestamp: number | null | undefined,
  utcOffsetSeconds?: number | null,
  options: Intl.DateTimeFormatOptions = DATE_OPTIONS,
): string {
  if (timestamp == null) return '';
  const date = dateForLocation(timestamp, utcOffsetSeconds);
  if (!date) return '';
  return date.toLocaleDateString([], withLocationTimezone(options, utcOffsetSeconds));
}

export function formatLocationTimeWithCue(
  timestamp: number | null | undefined,
  utcOffsetSeconds?: number | null,
  options: Intl.DateTimeFormatOptions = TIME_OPTIONS,
): string {
  const time = formatLocationTime(timestamp, utcOffsetSeconds, options);
  if (!time) return '';
  return hasLocationOffset(utcOffsetSeconds) ? `${time} LOCAL` : time;
}
