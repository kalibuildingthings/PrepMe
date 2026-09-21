"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrepMeStore } from "@/lib/store";
import { UsageBar } from "@/components/UsageBar";
import { remainingMinutesToday } from "@/lib/usage";

export default function DashboardPage() {
  const router = useRouter();
  const { questions, gaps, prepMethod, onboardingComplete, tier, usage } = usePrepMeStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !onboardingComplete) router.replace("/onboarding/jd-resume");
  }, [hydrated, onboardingComplete, router]);

  if (!hydrated) return null;

  const remaining = remainingMinutesToday(usage, tier);
  const canStart = remaining > 0;

  return (
    <main className="flex min-h-screen flex-col px-6 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{prepMethod ?? "STAR"} method</p>
          <h1 className="text-2xl font-bold text-ink">Your prep session</h1>
        </div>
      </header>

      <div className="mb-5">
        <UsageBar />
      </div>

      {gaps.length > 0 && (
        <div className="card mb-5">
          <h2 className="mb-2 text-sm font-semibold text-ink">Gaps we'll help you close</h2>
          <ul className="space-y-1.5">
            {gaps.slice(0, 4).map((g, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold text-ink">10 questions you're likely to be asked</h2>
      <div className="flex-1 space-y-2.5 overflow-y-auto pb-4">
        {questions.map((q, i) => (
          <div key={q.id} className="card flex gap-3 py-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
              {i + 1}
            </span>
            <p className="text-sm text-ink">{q.text}</p>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          disabled={!canStart}
          onClick={() => router.push("/session")}
          className="btn-primary w-full"
        >
          {canStart ? "Start prepping" : "No practice time left"}
        </button>
        {!canStart && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Come back tomorrow, or{" "}
            <button onClick={() => router.push("/pricing")} className="font-medium text-brand-500">
              upgrade your plan
            </button>
            .
          </p>
        )}
      </div>
    </main>
  );
}
