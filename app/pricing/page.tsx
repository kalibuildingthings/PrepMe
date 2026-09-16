"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePrepMeStore } from "@/lib/store";
import { TIERS } from "@/lib/tiers";
import { TierCard } from "@/components/TierCard";
import { BillingCycle, Tier } from "@/lib/types";

export default function PricingPage() {
  const router = useRouter();
  const { tier, billingCycle, setTier, onboardingComplete } = usePrepMeStore();
  const [cycle, setCycle] = useState<BillingCycle>(billingCycle);

  function handleSelect(id: Tier) {
    setTier(id, cycle);
    router.push(onboardingComplete ? "/dashboard" : "/onboarding/jd-resume");
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-8">
      <button onClick={() => router.back()} className="mb-4 self-start text-sm text-slate-400">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-ink">Practice as much as you need</h1>
      <p className="mt-1 text-sm text-slate-500">Start free. Upgrade anytime as your interview gets closer.</p>

      <div className="mt-5 flex rounded-2xl bg-slate-100 p-1 text-sm font-medium">
        <button
          onClick={() => setCycle("monthly")}
          className={`flex-1 rounded-xl py-2 transition ${cycle === "monthly" ? "bg-white shadow-sm text-ink" : "text-slate-500"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setCycle("yearly")}
          className={`flex-1 rounded-xl py-2 transition ${cycle === "yearly" ? "bg-white shadow-sm text-ink" : "text-slate-500"}`}
        >
          Yearly (save ~20%)
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {TIERS.map((t) => (
          <TierCard key={t.id} tier={t} active={tier === t.id} cycle={cycle} onSelect={handleSelect} />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Payment processing isn't wired up in this build yet — selecting a plan here just switches your practice-time
        limit.
      </p>
    </main>
  );
}
