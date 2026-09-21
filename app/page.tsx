"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePrepMeStore } from "@/lib/store";

export default function LandingPage() {
  const onboardingComplete = usePrepMeStore((s) => s.onboardingComplete);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (hydrated && onboardingComplete) {
    if (typeof window !== "undefined") window.location.replace("/dashboard");
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col justify-between px-6 py-10">
      <div />
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500 shadow-lg shadow-brand-200">
          <MicIcon className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">PrepMe</h1>
        <p className="mt-3 max-w-xs text-balance text-slate-500">
          Talk through your next interview, out loud, tailored to the job description and your resume.
        </p>
      </div>
      <div className="space-y-3">
        <Link href="/onboarding/jd-resume" className="btn-primary w-full">
          Get started
        </Link>
        <Link href="/pricing" className="block text-center text-sm font-medium text-slate-500">
          See plans &amp; pricing
        </Link>
      </div>
    </main>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
