const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

/** Collapses all whitespace (including newlines) into single spaces. */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Parses "1,331.00" or "15450.00" into a number. */
export function parseAmount(value: string): number {
  return Number(value.replace(/,/g, ''));
}

/** "JOSEPH  NYOKABI." → "JOSEPH NYOKABI" (case kept as sent, e.g. "KPLC PREPAID"). */
export function cleanName(value: string): string {
  return normalizeWhitespace(value).replace(/\.+$/, '');
}

/** Converts "8:26 PM" into 24h hours and minutes. */
function parseClock(time: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})\s*([AP]M)?$/i.exec(time.trim());
  if (!match) return null;
  let h = Number(match[1]);
  const m = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && h < 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return { h, m };
}

/** "1/11/26" + "8:26 PM" (day/month/2-digit year) → Date */
export function parseDmyDate(date: string, time: string): Date | undefined {
  const d = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(date.trim());
  const t = parseClock(time);
  if (!d || !t) return undefined;
  const year = d[3].length === 2 ? 2000 + Number(d[3]) : Number(d[3]);
  return new Date(year, Number(d[2]) - 1, Number(d[1]), t.h, t.m);
}

/** "05 Aug 2026" + "15:07" → Date */
export function parseDayMonthNameDate(date: string, time: string): Date | undefined {
  const d = /^(\d{1,2}) ([A-Za-z]{3,4}) (\d{4})$/.exec(date.trim());
  const t = parseClock(time);
  const month = d ? MONTHS[d[2].toLowerCase()] : undefined;
  if (!d || !t || month === undefined) return undefined;
  return new Date(Number(d[3]), month, Number(d[1]), t.h, t.m);
}
