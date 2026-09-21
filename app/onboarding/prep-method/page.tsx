"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stepper } from "@/components/Stepper";
import { usePrepMeStore } from "@/lib/store";
import { PREP_METHODS } from "@/lib/prepMethods";
import { PrepMethod } from "@/lib/types";

export default function PrepMethodPage() {
  const router = useRouter();
  const { prepMethod, setPrepMethod, setGapsAndQuestions, jdText, resumeText, completeOnboarding } = usePrepMeStore();
  const [selected, setSelected] = useState<PrepMethod | null>(prepMethod);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    if (!selected) return;
    setPrepMethod(selected);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, resumeText, prepMethod: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGapsAndQuestions(data.gaps, data.questions);
      completeOnboarding();
      router.push("/onboarding/ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong generating your questions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Stepper step={2} total={3} />
      <div className="flex-1 space-y-4 px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Pick your prep method</h1>
          <p className="mt-1 text-sm text-slate-500">
            This is the storytelling structure you'll use to answer behavioral questions.
          </p>
        </div>

        <div className="space-y-3">
          {PREP_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected === m.id ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-ink">{m.name}</span>
                {selected === m.id && <span className="text-brand-500">✓</span>}
              </div>
              <p className="mt-1 text-sm text-slate-500">{m.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.letters.map((l) => (
                  <span
                    key={l.letter}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    <b className="text-ink">{l.letter}</b> {l.label}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="px-6 pb-8">
        <button disabled={!selected || loading} onClick={handleContinue} className="btn-primary w-full">
          {loading ? "Analyzing your fit..." : "Continue"}
        </button>
      </div>
    </main>
  );
}
