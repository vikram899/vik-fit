export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}

export function toDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

export function todayDateString(): string {
  return toDateString(new Date());
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getCurrentWeekday(): number {
  return new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
