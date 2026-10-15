/** Local-date helpers. Days are stored as YYYY-MM-DD keys in the phone's own time zone. */

export function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** Keys for the n days ending on `endKey`, oldest first. */
export function lastNDays(endKey: string, n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(addDays(endKey, -i));
  }
  return keys;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function weekday(key: string): string {
  return DAYS[fromKey(key).getDay()];
}

export function dayOfMonth(key: string): number {
  return fromKey(key).getDate();
}

/** "Today", "Yesterday", or e.g. "Mon, 12 Oct". */
export function dayLabel(key: string): string {
  const today = todayKey();
  if (key === today) { return 'Today'; }
  if (key === addDays(today, -1)) { return 'Yesterday'; }
  if (key === addDays(today, 1)) { return 'Tomorrow'; }
  const d = fromKey(key);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function shortDate(key: string): string {
  const d = fromKey(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function timeLabel(at: number): string {
  const d = new Date(at);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}
