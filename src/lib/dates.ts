/**
 * Date helpers. Everything is computed in UTC so the generated site does not
 * shift depending on the machine that builds it, and formatted with the ru-RU
 * locale.
 */
import { LOCALE } from '../data/strings';

const DAY_MS = 86_400_000;

const parse = (iso: string): Date => new Date(`${iso}T00:00:00Z`);

export const toIso = (date: Date): string => date.toISOString().slice(0, 10);

/** Today's date in UTC, as YYYY-MM-DD. */
export const todayIso = (): string => toIso(new Date());

/** The seven ISO dates (Monday → Sunday) of the week containing `anchor`. */
export function weekOf(anchor: string): string[] {
  const date = parse(anchor);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date.getTime() - mondayOffset * DAY_MS);
  return Array.from({ length: 7 }, (_, i) => toIso(new Date(monday.getTime() + i * DAY_MS)));
}

/**
 * The anchor's week plus `weeksBack` earlier ones, in chronological order.
 * With weeksBack = 1 that is [last week, this week].
 */
export function weeksOf(anchor: string, weeksBack: number): string[][] {
  const date = parse(anchor);
  return Array.from({ length: weeksBack + 1 }, (_, i) => {
    const offset = weeksBack - i;
    return weekOf(toIso(new Date(date.getTime() - offset * 7 * DAY_MS)));
  });
}

const fmt = (iso: string, options: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', ...options }).format(parse(iso));

/** «ПН» */
export const shortDow = (iso: string): string => fmt(iso, { weekday: 'short' }).toUpperCase();

/** «1» */
export const dayNumber = (iso: string): string => fmt(iso, { day: 'numeric' });

/** «СУББОТА, 1 АВГ.» */
export const longLabel = (iso: string): string =>
  fmt(iso, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

/** «27 июл. – 2 авг. 2026», а внутри одного месяца — «3 – 9 авг. 2026». */
export function rangeLabel(dates: string[]): string {
  const first = dates[0];
  const last = dates[dates.length - 1];
  const day = (iso: string) => fmt(iso, { day: 'numeric' });
  const dayMonth = (iso: string) => fmt(iso, { day: 'numeric', month: 'short' });
  const sameMonth = first.slice(0, 7) === last.slice(0, 7);

  const from = sameMonth ? day(first) : dayMonth(first);
  return `${from} – ${dayMonth(last)} ${fmt(last, { year: 'numeric' })}`;
}

/** Отметка времени сборки: «5 авг. 2026 г., 12:02 UTC». */
export function buildStamp(now: Date): string {
  const stamp = new Intl.DateTimeFormat(LOCALE, {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(now);
  return `${stamp} UTC`;
}
