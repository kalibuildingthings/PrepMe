import { FREE_DAILY_LIMIT_MINUTES, tierById } from "./tiers";
import { Tier } from "./types";

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function weekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Monday = 0
  date.setUTCDate(date.getUTCDate() - dayNum);
  return date.toISOString().slice(0, 10);
}

export interface UsageLog {
  minutesByDay: Record<string, number>;
}

function minutesForWeek(log: UsageLog, week: string): number {
  return Object.entries(log.minutesByDay).reduce((sum, [day, mins]) => {
    return weekKey(new Date(day)) === week ? sum + mins : sum;
  }, 0);
}

export function remainingMinutesToday(log: UsageLog, tier: Tier): number {
  const usedToday = log.minutesByDay[todayKey()] ?? 0;
  const usedThisWeek = minutesForWeek(log, weekKey());
  const def = tierById(tier);

  if (tier === "unlimited") return Infinity;

  if (tier === "free") {
    return Math.max(0, FREE_DAILY_LIMIT_MINUTES - usedToday);
  }

  // "plus" tier: 72h/week pool, no separate daily cap.
  const weeklyMinutes = def.weeklyMinutes ?? 0;
  return Math.max(0, weeklyMinutes - usedThisWeek);
}

export function formatMinutes(mins: number): string {
  if (!isFinite(mins)) return "Unlimited";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
