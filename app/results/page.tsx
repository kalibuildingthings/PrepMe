"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrepMeStore } from "@/lib/store";
import { ScoreRing } from "@/components/ScoreRing";
import { remainingMinutesToday } from "@/lib/usage";

export default function ResultsPage() {
  const router = useRouter();
  const { results, tier, usage } = usePrepMeStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const latest = results[0];
  const canRetry = remainingMinutesToday(usage, tier) > 0;

  if (!hydrated) return null;

  if (!latest) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-500">No completed sessions yet.</p>
        <button onClick={() => router.push("/dashboard")} className="btn-primary mt-6">
          Back to dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold text-ink">Nice work!</h1>
      <p className="mb-6 text-sm text-slate-500">Here's how you did across all 10 questions.</p>

      <div className="mb-6 flex justify-center">
        <ScoreRing value={latest.average} size={140} />
      </div>

      {latest.summary && <p className="card mb-6 text-sm text-slate-600">{latest.summary}</p>}

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-emerald-600">Strengths</h3>
          <ul className="space-y-1.5">
            {latest.strengths.length ? (
              latest.strengths.map((s, i) => (
                <li key={i} className="text-xs text-slate-600">
                  {s}
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400">—</li>
            )}
          </ul>
        </div>
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-amber-600">To improve</h3>
          <ul className="space-y-1.5">
            {latest.weaknesses.length ? (
              latest.weaknesses.map((s, i) => (
                <li key={i} className="text-xs text-slate-600">
                  {s}
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400">—</li>
            )}
          </ul>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-ink">Question-by-question</h2>
      <div className="flex-1 space-y-2.5 overflow-y-auto pb-4">
        {latest.scores.map((s, i) => (
          <div key={s.questionId} className="card py-3.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink">
                {i + 1}. {s.question}
              </p>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  s.score >= 7.5
                    ? "bg-emerald-50 text-emerald-600"
                    : s.score >= 5
                    ? "bg-brand-50 text-brand-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {s.score.toFixed(0)}/10
              </span>
            </div>
            {s.feedback && <p className="mt-1.5 text-xs text-slate-500">{s.feedback}</p>}
          </div>
        ))}
      </div>

      <div className="space-y-2.5 pt-2">
        {canRetry && (
          <button onClick={() => router.push("/session")} className="btn-primary w-full">
            Practice again today
          </button>
        )}
        <button onClick={() => router.push("/dashboard")} className="btn-secondary w-full">
          Back to dashboard
        </button>
      </div>
    </main>
  );
}
