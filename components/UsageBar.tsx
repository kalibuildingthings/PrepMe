"use client";

import Link from "next/link";
import { usePrepMeStore } from "@/lib/store";
import { formatMinutes, remainingMinutesToday } from "@/lib/usage";
import { tierById } from "@/lib/tiers";

export function UsageBar() {
  const tier = usePrepMeStore((s) => s.tier);
  const usage = usePrepMeStore((s) => s.usage);
  const remaining = remainingMinutesToday(usage, tier);
  const def = tierById(tier);
  const cap = tier === "free" ? 60 : def.weeklyMinutes ?? 1;
  const used = isFinite(remaining) ? Math.max(0, cap - remaining) : 0;
  const pct = isFinite(remaining) ? Math.min(100, (used / cap) * 100) : 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">
          {tier === "free" ? "Today's practice time" : tier === "plus" ? "This week's practice time" : "Unlimited"}
        </span>
        <Link href="/pricing" className="text-xs font-medium text-brand-500">
          {tier === "unlimited" ? "Manage plan" : "Upgrade"}
        </Link>
      </div>
      {tier !== "unlimited" ? (
        <>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{formatMinutes(remaining)} left</p>
        </>
      ) : (
        <p className="mt-1.5 text-xs text-slate-500">Practice as much as you like.</p>
      )}
    </div>
  );
}
