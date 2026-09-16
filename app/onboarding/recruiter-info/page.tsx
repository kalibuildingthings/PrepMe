"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stepper } from "@/components/Stepper";
import { usePrepMeStore } from "@/lib/store";
import { RecruiterInfo } from "@/lib/types";

const FIELDS: { key: keyof Omit<RecruiterInfo, "hasInfo">; label: string; placeholder: string }[] = [
  {
    key: "processSteps",
    label: "Number of steps in the hiring process",
    placeholder: "e.g. 3 rounds: recruiter screen, panel, final with VP",
  },
  {
    key: "topicsToCover",
    label: "Topics they said would be covered",
    placeholder: "e.g. system design, past leadership experience",
  },
  {
    key: "evaluationCriteria",
    label: "What will be evaluated",
    placeholder: "e.g. communication, technical depth, culture fit",
  },
  { key: "valuesAssessed", label: "Company values being assessed", placeholder: "e.g. ownership, customer obsession" },
  { key: "exampleQuestions", label: "Any example questions they shared", placeholder: "Paste them here" },
];

export default function RecruiterInfoPage() {
  const router = useRouter();
  const { recruiterInfo, setRecruiterInfo } = usePrepMeStore();
  const [skip, setSkip] = useState(!recruiterInfo.hasInfo);
  const [local, setLocal] = useState<RecruiterInfo>(recruiterInfo);

  function handleContinue() {
    setRecruiterInfo({ ...local, hasInfo: !skip });
    router.push("/onboarding/prep-method");
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Stepper step={2} total={4} />
      <div className="flex-1 space-y-5 px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Anything from the recruiter?</h1>
          <p className="mt-1 text-sm text-slate-500">
            Some recruiters share what to expect — if yours did, add it here. Totally fine to skip.
          </p>
        </div>

        <button
          onClick={() => setSkip(!skip)}
          className={`w-full rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition ${
            skip ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          {skip ? "✓ " : ""}They didn't share anything — skip this step
        </button>

        {!skip && (
          <div className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-1.5 block text-sm font-semibold text-ink">{f.label}</label>
                <textarea
                  className="textarea min-h-[70px]"
                  placeholder={f.placeholder}
                  value={local[f.key]}
                  onChange={(e) => setLocal({ ...local, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-8">
        <button onClick={handleContinue} className="btn-primary w-full">
          Continue
        </button>
      </div>
    </main>
  );
}
